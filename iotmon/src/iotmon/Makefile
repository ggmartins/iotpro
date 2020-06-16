all:
	GOPATH=${PWD}/../../ go build iotmon.go

dep:
	brew update && brew tap jlhonora/lsusb && brew install lsusb
	GOPATH=${PWD}/../../ go get -u github.com/golang/dep/cmd/dep
	GOPATH=${PWD}/../../ ../../bin/dep ensure
