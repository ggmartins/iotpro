package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"
)

type iotBundle struct {
	id               string
	idType           string
	bundleList       []string
	bundleListType   []string
	bundleListResolv []string
}

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

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
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

func getStatusUsb() map[string]string {
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
	return result
}

func getStatusEther(ouiMap map[string]string) map[string]string {
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
	//fmt.Printf("%#v\n", bundleList)
	//fmt.Printf("%#v\n", bundleListTypes)
	//fmt.Printf("%#v\n", bundleListResolv)
	fmt.Println("default route iface:" + ifnToEth[rountIfn])
	fmt.Println("routeIp: " + routeIP)
	log.Println("Finished.")
	return result
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
	log.Println("Initializing...")

	if fileExists(ouiFileLocal) {
		//fmt.Println("Loading " + ouiFileLocal + ".")
	} else {
		DownloadFile(ouiFileLocal, ouiFileURL)
	}

	log.Println("Done.")
	if !fileExists(ouiFileLocal) {

		log.Panic("Unable to load " + ouiFileLocal)
	}

	ouiMap := getOUIMap(ouiFileLocal)
	//fmt.Printf("%s\n", oui["test"])
	/*lsusb := getStatusUsb()
	bsonUsb, err := json.Marshal(lsusb)
	if err != nil {
		fmt.Println("error:", err)
	}
	os.Stdout.Write(bsonUsb)
	fmt.Println("")*/
        //https://stackoverflow.com/questions/31361375/how-to-check-if-a-monitor-is-plugged-in-linux
	lsether := getStatusEther(ouiMap)
	bsonEther, err := json.Marshal(lsether)
	if err != nil {
		fmt.Println("error:", err)
	}
	os.Stdout.Write(bsonEther)
	fmt.Println("")
}
