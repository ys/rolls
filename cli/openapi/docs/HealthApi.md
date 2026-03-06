# \HealthApi

All URIs are relative to *https://lr.adobe.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetHealth**](HealthApi.md#GetHealth) | **Get** /v2/health | Lightroom Services health check



## GetHealth

> GetHealth200Response GetHealth(ctx).XAPIKey(xAPIKey).Execute()

Lightroom Services health check



### Example

```go
package main

import (
    "context"
    "fmt"
    "os"
    openapiclient "./openapi"
)

func main() {
    xAPIKey := "xAPIKey_example" // string | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.HealthApi.GetHealth(context.Background()).XAPIKey(xAPIKey).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `HealthApi.GetHealth``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GetHealth`: GetHealth200Response
    fmt.Fprintf(os.Stdout, "Response from `HealthApi.GetHealth`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetHealthRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 

### Return type

[**GetHealth200Response**](GetHealth200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

