package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func main()  {
	lambda.Start(handleRequest)
}

func handleRequest() (string, error) {
	
	return "hello from golang", nil
}