# \AccountsApi

All URIs are relative to *https://lr.adobe.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetAccount**](AccountsApi.md#GetAccount) | **Get** /v2/account | Retrieve the user account metadata



## GetAccount

> GetAccount200Response GetAccount(ctx).XAPIKey(xAPIKey).Authorization(authorization).Execute()

Retrieve the user account metadata



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
    resp, r, err := apiClient.AccountsApi.GetAccount(context.Background()).XAPIKey(xAPIKey).Authorization(authorization).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AccountsApi.GetAccount``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GetAccount`: GetAccount200Response
    fmt.Fprintf(os.Stdout, "Response from `AccountsApi.GetAccount`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetAccountRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 

### Return type

[**GetAccount200Response**](GetAccount200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

