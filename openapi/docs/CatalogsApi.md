# \CatalogsApi

All URIs are relative to *https://lr.adobe.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetCatalog**](CatalogsApi.md#GetCatalog) | **Get** /v2/catalog | Retrieve the user catalog metadata



## GetCatalog

> GetCatalog200Response GetCatalog(ctx).XAPIKey(xAPIKey).Authorization(authorization).Execute()

Retrieve the user catalog metadata



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
    authorization := "authorization_example" // string | Bearer [token] - User access token of an authenticated Lightroom customer

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.CatalogsApi.GetCatalog(context.Background()).XAPIKey(xAPIKey).Authorization(authorization).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `CatalogsApi.GetCatalog``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GetCatalog`: GetCatalog200Response
    fmt.Fprintf(os.Stdout, "Response from `CatalogsApi.GetCatalog`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetCatalogRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 

### Return type

[**GetCatalog200Response**](GetCatalog200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

