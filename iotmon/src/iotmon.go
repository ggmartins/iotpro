package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"reflect"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"gopkg.in/yaml.v3"
)

//Config monitor config
type Config struct {
	URL    string `yaml:"url"`
	KEY    string `yaml:"key"`
	Status string `yaml:"status"`
}

//Upload post response
type Upload struct {
	Message   string `json:"message"`
	UploadURL string `json:"uploadUrl"`
}

//IoTBundle status update, do not change
type IoTBundle struct {
	UUID           string   `yaml:"uuid" json:"uuid"`
	CreatedAt      string   `yaml:"createdAt" json:"createdAt"`
	ID             string   `yaml:"id" json:"id"`
	IDType         string   `yaml:"idType" json:"idType"`
	BundleList     []string `yaml:"bundleList,flow" json:"bundleList,flow"`
	BundleListType []string `yaml:"bundleListType,flow" json:"bundleListType,flow"`
	//BundleListResolv []string `yaml:"bundleListResolv,flow" json:"bundleListResolv,flow"`
	BundleListDesc []string `yaml:"bundleListDesc,flow" json:"bundleListDesc,flow"`
	BundleListUUID []string `yaml:"bundleListUUID,flow" json:"bundleListUUID,flow"`
	BundleListAdd  []string `yaml:"-" json:"bundleListAdd`
	BundleListDel  []string `yaml:"-" json:"bundleListDel`
	HasChanged     bool     `yaml:"-" json:"hasChanged`
	LastSeen       string   `yaml:"-" json:"lastSeen`
	Key            string   //iotmon.config.yaml
}

const iotstatus = "./iotmon.status"
const iotstatusbkup = "./iotmon.status.backup"
const iotstatusyaml = "./iotmon.status.yaml"
const iotconfigyaml = "./iotmon.config.yaml"
const ouiFileURL = "http://standards-oui.ieee.org/oui.txt"
const ouiFileLocal = "/tmp/oui.txt"

//DownloadFile lift https://golangcode.com/download-a-file-from-a-url/
func DownloadFile(filepath string, url string) error {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Create the file
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	return err
}

//UploadFile lift from https://gist.github.com/mattetti/5914158
func UploadFile(uri string, params map[string]string, formFile, path string) error {
	var resp *http.Response
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(formFile, filepath.Base(path))
	if err != nil {
		return err
	}
	_, err = io.Copy(part, file)

	for key, val := range params {
		_ = writer.WriteField(key, val)
	}
	err = writer.Close()
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", uri, body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if err != nil {
		log.Fatal(err)
	}
	client := &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		log.Fatal(err)
	} else {
		body := &bytes.Buffer{}
		_, err = body.ReadFrom(resp.Body)
		if err != nil {
			log.Fatal(err)
		}
		resp.Body.Close()

		if resp.StatusCode != 200 {
			log.Printf("Error: %d", resp.StatusCode)
			err = fmt.Errorf(fmt.Sprintf("%s", body))
		} else {
			log.Printf("URL Signed OK.")
		}
	}
	return err
}

func fileExists(filename string, fileOnly bool) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	if fileOnly {
		return !info.IsDir()
	}
	return true
}

//lift https://www.golangprograms.com/golang-program-for-implementation-of-levenshtein-distance.html
func levenshtein(str1, str2 []rune) int {
	s1len := len(str1)
	s2len := len(str2)
	column := make([]int, len(str1)+1)

	for y := 1; y <= s1len; y++ {
		column[y] = y
	}
	for x := 1; x <= s2len; x++ {
		column[0] = x
		lastkey := x - 1
		for y := 1; y <= s1len; y++ {
			oldkey := column[y]
			var incr int
			if str1[y-1] != str2[x-1] {
				incr = 1
			}

			column[y] = minimum(column[y]+1, column[y-1]+1, lastkey+incr)
			lastkey = oldkey
		}
	}
	return column[s1len]
}

func minimum(a, b, c int) int {
	if a < b {
		if a < c {
			return a
		}
	} else {
		if b < c {
			return b
		}
	}
	return c
}

func getStatusUsb() (string, map[string]string) {
	result := make(map[string]string)
	r, error := regexp.Compile(" ([0-9a-f]{4}:[0-9a-fA-Z]{4}) (.*)")
	if error != nil {
		log.Panic(error)
	}
	cmd := exec.Command("lsusb")
	var out io.Reader

	out, err := cmd.StdoutPipe()

	if err = cmd.Start(); err != nil {
		log.Fatal(err)
	}
	defer cmd.Process.Kill()
	s := bufio.NewScanner(out)
	nstr := "  \t\n"
	for s.Scan() {
		s := s.Text()
		if len(s) > 0 {

			m := r.FindStringSubmatch(s)

			if len(m) > 2 {
				fmt.Printf("%s - %s\n", m[1],
					strings.Trim(strings.Split(m[2], "Serial")[0], nstr))
				result[m[1]] = strings.Trim(strings.Split(m[2], "Serial")[0], nstr)
			}
		}
	}
	log.Println("Done.")
	return "", result
}

func getStatusEther(ouiMap map[string]string) (string, map[string]string) {
	nstr := "  \t\n"
	//find out the default routing ip
	var routeIP string
	var bundleList []string
	var bundleListTypes []string
	var bundleListResolv []string
	result := make(map[string]string)
	r, error := regexp.Compile("^(default|0.0.0.0)[ \t]+([0-9.]+)[ \t]+")
	if error != nil {
		log.Panic(error)
	}
	cmd := exec.Command("netstat", "-rn")
	var out io.Reader
	out, err := cmd.StdoutPipe()
	if err = cmd.Start(); err != nil {
		log.Fatal(err)
	}
	defer cmd.Process.Kill()
	s := bufio.NewScanner(out)
	for s.Scan() {
		s := s.Text()
		if len(s) > 0 {

			m := r.FindStringSubmatch(s)

			if len(m) > 2 {
				//fmt.Printf("%s - %s\n", m[1],
				//	strings.Trim(m[2], nstr))
				routeIP = strings.Trim(m[2], nstr)
				break
			}
		}
	}
	//ifconfig
	var ifn string
	var rountIfn string
	var max int
	ifnToEth := make(map[string]string)

	rifn, error := regexp.Compile("^([a-z0-9\\.]+): .*")
	if error != nil {
		log.Panic(error)
	}
	reth, error := regexp.Compile(".*ether (.*) ")
	if error != nil {
		log.Panic(error)
	}
	rnet, error := regexp.Compile("^.*inet (.*) netmask.*")
	if error != nil {
		log.Panic(error)
	}

	cmd = exec.Command("/sbin/ifconfig")
	out, err = cmd.StdoutPipe()
	if err = cmd.Start(); err != nil {
		log.Fatal(err)
	}
	defer cmd.Process.Kill()
	s = bufio.NewScanner(out)
	for s.Scan() {
		s := s.Text()
		if len(s) > 0 {
			//fmt.Printf("%s\n", s)
			m := rifn.FindStringSubmatch(s)
			if len(m) > 1 {
				//fmt.Printf("%s\n", m[1])
				ifn = m[1]
				ifnToEth[ifn] = ""
			}
			m = reth.FindStringSubmatch(s)
			if len(m) > 1 {
				//fmt.Printf("%s\n", m[1])
				ifnToEth[ifn] = strings.Trim(m[1], nstr)
			}
			m = rnet.FindStringSubmatch(s)
			if len(m) > 1 {
				var s1 = []rune(m[0])
				var s2 = []rune(routeIP)
				//TODO: parse ip in m[1] and calculate netmask
				//levenshtein not best here
				//fmt.Printf("%s\n", m[1])
				n := levenshtein(s1, s2)
				if n > max {
					max = n
					rountIfn = ifn
				}
			}
		}
	}
	for _, value := range ifnToEth {
		if value != "" {
			oui := ouiMap[value[:8]]
			bundleList = append(bundleList, value)
			bundleListTypes = append(bundleListTypes, "macaddr")
			bundleListResolv = append(bundleListResolv, oui)
		}
	}
	fmt.Println("default route iface:" + ifnToEth[rountIfn])
	fmt.Println("routeIp: " + routeIP)
	log.Println("Finished.")
	return ifnToEth[rountIfn], result
}

func getOUIMap(filePath string) map[string]string {
	roui, error := regexp.Compile("^([A-F0-9]{2}-[A-F0-9]{2}-[A-F0-9]{2}).*\\(hex\\)[ \t]+(.*)")
	if error != nil {
		log.Panic(error)
	}
	result := make(map[string]string)
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		s := scanner.Text()
		m := roui.FindStringSubmatch(s)
		if len(m) > 2 {
			//fmt.Printf("[%s] - [%s]\n",
			//	strings.ReplaceAll(strings.ToLower(m[1]), "-", ":"),
			//	m[2])
			result[strings.ReplaceAll(strings.ToLower(m[1]), "-", ":")] = m[2]
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

	return result
}

func main() {
	//lift https://blog.golang.org/go-maps-in-action
	log.Printf("Initializing...\n")
	var resp *http.Response
	var err error
	iotstatusExist := true
	config := Config{}
	conffile, err := ioutil.ReadFile(iotconfigyaml)
	if err != nil {
		panic(err)
	}
	err = yaml.Unmarshal(conffile, &config)
	if err != nil {
		panic(err)
	}

	if fileExists(ouiFileLocal, true) {
		//fmt.Println("Loading " + ouiFileLocal + ".")
	} else {
		DownloadFile(ouiFileLocal, ouiFileURL)
	}

	if !fileExists(iotstatus, true) {
		if config.Status == "enable" || config.Status == "enabled" {
			if fileExists(iotstatusyaml, true) {
				log.Printf("INFO: NEW EXECUTION, renaming old %s to %s.\n", iotstatusyaml, iotstatusbkup)
				err := os.Rename(iotstatusyaml, iotstatusbkup)
				if err != nil {
					log.Fatal(err)
				}
			}
		}
		iotstatusExist = false
	}
	log.Println("Done.")

	log.Printf("Using key: [%s]\n", config.KEY[:3]+"****"+config.KEY[len(config.KEY)-3:])
	if !fileExists(ouiFileLocal, true) {
		log.Panic("Unable to load " + ouiFileLocal)
	}

	ouiMap := getOUIMap(ouiFileLocal)
	//fmt.Printf("%s\n", oui["test"])
	_, maplsusb := getStatusUsb()

	//https://stackoverflow.com/questions/31361375/how-to-check-if-a-monitor-is-plugged-in-linux
	defroute, maplsether := getStatusEther(ouiMap)

	iotBundle := IoTBundle{}
	iotBundleOld := IoTBundle{}
	seed := strings.NewReader(defroute + defroute) //TODO: better seeding func
	uuid.SetRand(seed)
	uid, err := uuid.NewRandom()
	if err != nil {
		panic(err)
	}
	//fmt.Printf("%#v %s\n", reflect.ValueOf(maplsether).MapKeys(), uid)
	iotBundle.UUID = fmt.Sprintf("%s", uid)
	iotBundle.ID = defroute
	iotBundle.IDType = "mac"
	iotBundle.CreatedAt = time.Now().Format(time.RFC3339)
	for _, key := range reflect.ValueOf(maplsusb).MapKeys() {
		iotBundle.BundleList = append(iotBundle.BundleList, fmt.Sprintf("%s", key))
		iotBundle.BundleListType = append(iotBundle.BundleListType, "usb")
		//iotBundle.BundleListResolv = append(iotBundle.BundleListResolv, "Unresolved") //TBD, use OUI for mapping mac addresses
		iotBundle.BundleListDesc = append(iotBundle.BundleListDesc, maplsusb[fmt.Sprintf("%s", key)])

		seed := strings.NewReader(fmt.Sprintf("%s", key) + fmt.Sprintf("%s", key)) //TODO: better seeding
		uuid.SetRand(seed)
		devuid, err := uuid.NewRandom()
		var struid string
		if err != nil {
			panic(err)
			struid = "00000000-0000-0000-0000-000000000000"
		}
		fmt.Printf("%s\n", fmt.Sprintf("%s", devuid))
		struid = fmt.Sprintf("%s", devuid)
		iotBundle.BundleListUUID = append(iotBundle.BundleListUUID, struid)
	}
	for _, key := range reflect.ValueOf(maplsether).MapKeys() {
		iotBundle.BundleList = append(iotBundle.BundleList, fmt.Sprintf("%s", key))
		iotBundle.BundleListType = append(iotBundle.BundleListType, "mac")
		//iotBundle.BundleListResolv = append(iotBundle.BundleListResolv, "Unresolved") //TBD, use OUI for mapping mac addresses
		iotBundle.BundleListDesc = append(iotBundle.BundleListDesc, maplsether[fmt.Sprintf("%s", key)])
		seed := strings.NewReader(fmt.Sprintf("%s", key) + fmt.Sprintf("%s", key)) //TODO: better seeding
		uuid.SetRand(seed)
		devuid, err := uuid.NewRandom()
		var struid string
		if err != nil {
			panic(err)
			struid = "00000000-0000-0000-0000-000000000000"
		}
		struid = fmt.Sprintf("%s", devuid)
		iotBundle.BundleListUUID = append(iotBundle.BundleListUUID, struid)
	}

	yamlfile, err := ioutil.ReadFile(iotstatusyaml)
	if err != nil {
		//iotBundle.BundleList = reflect.ValueOf(maplsether).MapKeys()
		data, err := yaml.Marshal(iotBundle)
		if err != nil {
			panic(err)
		}
		f, err := os.Create(iotstatusyaml)
		if err != nil {
			panic(err)
		}
		defer f.Close()
		f.Write(data)

	} else {
		err = yaml.Unmarshal(yamlfile, &iotBundleOld)
		log.Printf("INFO: using [%s] with timestamp: %s as cached.\n", iotstatusyaml, iotBundleOld.CreatedAt)
		if err != nil {
			panic(err)
		}
	}

	if iotBundleOld.UUID != "" {
		found := false
		for _, id := range iotBundle.BundleList {
			for _, idOld := range iotBundleOld.BundleList {
				if id == idOld {
					found = true
					break
				}
			}
			if !found {
				iotBundle.BundleListAdd = append(iotBundle.BundleListAdd, id)
				iotBundle.HasChanged = true
			}
		}
		for _, idOld := range iotBundleOld.BundleList {
			for _, id := range iotBundle.BundleList {
				if id == idOld {
					found = true
					break
				}
			}
			if !found {
				iotBundle.BundleListDel = append(iotBundle.BundleListDel, idOld)
				iotBundle.HasChanged = true
			}
		}
		iotBundle.CreatedAt = iotBundleOld.CreatedAt
	}
	iotBundle.LastSeen = time.Now().Format(time.RFC3339)
	iotBundle.Key = config.KEY
	jsonOut, err := json.Marshal(iotBundle)
	if err != nil {
		log.Printf("error: %s\n", err)
	}
	checkUpload := false
	if config.Status == "enable" || config.Status == "enabled" {
		if iotstatusExist {
			client := &http.Client{}
			u, err := url.Parse(config.URL)
			u.Path = path.Join(u.Path, "status")
			u.Path = path.Join(u.Path, iotBundle.UUID)

			req, err := http.NewRequest(http.MethodPut, u.String(), bytes.NewBuffer(jsonOut))

			if err != nil {
				panic(err)
			}
			req.Header.Set("Key", iotBundle.Key)
			req.Header.Set("Content-Type", "application/json; charset=utf-8")
			resp, err = client.Do(req)
			if err != nil {
				panic(err)
			} else {
				checkUpload = true
				log.Printf("PUT Status %#v", resp.Status)
			}
			//log.Printf("PUT Update %#v %s\n", resp.Status, bodyToString(resp.Body))
		} else {
			client := &http.Client{}
			u, err := url.Parse(config.URL)
			u.Path = path.Join(u.Path, "status")
			/*resp, err = http.Post(u.String(),
				"application/json",
				strings.NewReader(string(jsonOut)))
			if err != nil {
				panic(err)
			}*/

			req, err := http.NewRequest(http.MethodPost, u.String(), bytes.NewBuffer(jsonOut))
			if err != nil {
				panic(err)
			}
			req.Header.Set("Key", iotBundle.Key)
			req.Header.Set("Content-Type", "application/json; charset=utf-8")
			resp, err = client.Do(req)
			if err != nil {
				panic(err)
			}

			log.Printf("POST Create %#v\n", resp.Status)

			if resp.StatusCode == 200 {
				_, err := os.Create(iotstatus)
				if err != nil {
					panic(err)
				}
			}
		}
	} else {
		if iotstatusExist {
			client := &http.Client{}
			u, err := url.Parse(config.URL)
			u.Path = path.Join(u.Path, "status")
			u.Path = path.Join(u.Path, iotBundle.UUID)

			req, err := http.NewRequest(http.MethodDelete, u.String(), bytes.NewBuffer(jsonOut))
			if err != nil {
				panic(err)
			}
			req.Header.Set("Key", iotBundle.Key)
			req.Header.Set("Content-Type", "application/json; charset=utf-8")
			resp, err = client.Do(req)
			if err != nil {
				panic(err)
			}

			log.Printf("DEL Delete %#v %s\n", resp.Status, bodyToString(resp.Body))
			os.Remove(iotstatus) //disable request by removing status ("flag") file
		} else {
			log.Println("IoT Device Disabled.")
			os.Exit(0)
		}
	}

	if checkUpload {
		files, err := ioutil.ReadDir("./upload")
		if err != nil {
			log.Fatal(err)
		}

		for _, file := range files {

			u, err := url.Parse(config.URL)
			u.Path = path.Join(u.Path, "upload")
			u.Path = path.Join(u.Path, iotBundle.UUID)
			u.Path = path.Join(u.Path, "attachment")
			resp, err = http.Get(u.String()) //,
			//"application/json",
			//strings.NewReader(string(jsonOut)))

			if err != nil {
				panic(err)
			}

			filepath := path.Join("./upload", file.Name())
			temppath := path.Join("/tmp/uploaded", file.Name())
			log.Printf("GET Upload of %s %s (%#v)\n", filepath, u.Path, resp.Status)
			decoder := json.NewDecoder(resp.Body)
			var uploadResp Upload
			err = decoder.Decode(&uploadResp)
			if err != nil {
				panic(err)
			}

			if resp.StatusCode == 200 {
				log.Printf("URL Signed: %#v\n", uploadResp.UploadURL)
				err = UploadFile(uploadResp.UploadURL, nil, "file", filepath)
				if err != nil {
					log.Fatal(err)
				} else {
					if !fileExists(temppath, false) {
						err = os.Mkdir(temppath, 0755)
						if err != nil {
							log.Fatal(err)
						}
					}
					err = os.Rename(filepath, temppath)
					if err != nil {
						log.Fatal(err)
					}
				}
			} else {
				log.Printf("Message: %s\n", uploadResp.Message)
			}
		}
	}
}

func bodyToString(body io.Reader) string {
	bodyBytes, err := ioutil.ReadAll(body)
	if err != nil {
		log.Fatal(err)
	}
	bodyString := string(bodyBytes)
	return bodyString
}
