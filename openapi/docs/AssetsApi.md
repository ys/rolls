# \AssetsApi

All URIs are relative to *https://lr.adobe.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateAsset**](AssetsApi.md#CreateAsset) | **Put** /v2/catalogs/{catalog_id}/assets/{asset_id} | Create asset
[**CreateAssetOriginal**](AssetsApi.md#CreateAssetOriginal) | **Put** /v2/catalogs/{catalog_id}/assets/{asset_id}/master | Create an asset original file
[**GenerateRenditions**](AssetsApi.md#GenerateRenditions) | **Post** /v2/catalogs/{catalog_id}/assets/{asset_id}/renditions | Generate renditions for an original file
[**GetAsset**](AssetsApi.md#GetAsset) | **Get** /v2/catalogs/{catalog_id}/assets/{asset_id} | Get a catalog asset
[**GetAssetExternalXmpDevelopSetting**](AssetsApi.md#GetAssetExternalXmpDevelopSetting) | **Get** /v2/catalogs/{catalog_id}/assets/{asset_id}/xmp/develop | Get latest asset external xmp develop setting
[**GetAssetRendition**](AssetsApi.md#GetAssetRendition) | **Get** /v2/catalogs/{catalog_id}/assets{asset_id}/renditions/{rendition_type} | Get latest asset rendition
[**GetAssets**](AssetsApi.md#GetAssets) | **Get** /v2/catalogs/{catalog_id}/assets | Retrieve assets
[**PutAssetExternalXmpDevelopSetting**](AssetsApi.md#PutAssetExternalXmpDevelopSetting) | **Put** /v2/catalogs/{catalog_id}/assets/{asset_id}/xmp/develop | Create asset external xmp develop setting file



## CreateAsset

> CreateAsset(ctx, catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).CreateAssetRequest(createAssetRequest).Execute()

Create asset



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
    catalogId := "catalogId_example" // string | Identifier of the catalog in which the asset will be created.
    assetId := "assetId_example" // string | Client-generated Lightroom unique identifier for the new asset.
    createAssetRequest := *openapiclient.NewCreateAssetRequest() // CreateAssetRequest | Initial asset metadata and import information.

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.CreateAsset(context.Background(), catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).CreateAssetRequest(createAssetRequest).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.CreateAsset``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog in which the asset will be created. | 
**assetId** | **string** | Client-generated Lightroom unique identifier for the new asset. | 

### Other Parameters

Other parameters are passed through a pointer to a apiCreateAssetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **createAssetRequest** | [**CreateAssetRequest**](CreateAssetRequest.md) | Initial asset metadata and import information. | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateAssetOriginal

> CreateAssetOriginal(ctx, catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).ContentType(contentType).ContentLength(contentLength).ContentRange(contentRange).Execute()

Create an asset original file



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
    contentType := "contentType_example" // string | Content type. For jpeg assets, the only allowed type is 'image/jpeg'. For camera raw assets the type is 'application/octet-stream'. For video assets, the content-type is of the format video/_* where * depends upon the video type and can contain only ASCII characters. Or the content-type of video can be application/octet-stream;video
    catalogId := "catalogId_example" // string | Identifier of the catalog in which the asset will be created.
    assetId := "assetId_example" // string | Identifier of the asset to which the XMP settings are associated.
    contentLength := int32(56) // int32 | Length in bytes of the content. (optional)
    contentRange := "contentRange_example" // string | Byte range for the request, including first and last bytes and entity length as defined in RFC 2616. Should be included only when the data cannot be uploaded in a single call. (optional)

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.CreateAssetOriginal(context.Background(), catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).ContentType(contentType).ContentLength(contentLength).ContentRange(contentRange).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.CreateAssetOriginal``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog in which the asset will be created. | 
**assetId** | **string** | Identifier of the asset to which the XMP settings are associated. | 

### Other Parameters

Other parameters are passed through a pointer to a apiCreateAssetOriginalRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 
 **contentType** | **string** | Content type. For jpeg assets, the only allowed type is &#39;image/jpeg&#39;. For camera raw assets the type is &#39;application/octet-stream&#39;. For video assets, the content-type is of the format video/_* where * depends upon the video type and can contain only ASCII characters. Or the content-type of video can be application/octet-stream;video | 


 **contentLength** | **int32** | Length in bytes of the content. | 
 **contentRange** | **string** | Byte range for the request, including first and last bytes and entity length as defined in RFC 2616. Should be included only when the data cannot be uploaded in a single call. | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GenerateRenditions

> GenerateRenditions202Response GenerateRenditions(ctx, catalogId, assetId).XAPIKey(xAPIKey).XGenerateRenditions(xGenerateRenditions).Authorization(authorization).ContentLength(contentLength).Execute()

Generate renditions for an original file



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
    xGenerateRenditions := "xGenerateRenditions_example" // string | One or multiple of the supported rendition types separated by ','. Supported rendition types are : ['fullsize', '2560'].
    authorization := "authorization_example" // string | Bearer [token] - User access token of an authenticated Lightroom customer
    catalogId := "catalogId_example" // string | Identifier of the catalog in which the asset was created.
    assetId := "assetId_example" // string | Identifier of the asset for which rendition gets generated.
    contentLength := int32(56) // int32 | Length in bytes of the content. (optional)

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.GenerateRenditions(context.Background(), catalogId, assetId).XAPIKey(xAPIKey).XGenerateRenditions(xGenerateRenditions).Authorization(authorization).ContentLength(contentLength).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.GenerateRenditions``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GenerateRenditions`: GenerateRenditions202Response
    fmt.Fprintf(os.Stdout, "Response from `AssetsApi.GenerateRenditions`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog in which the asset was created. | 
**assetId** | **string** | Identifier of the asset for which rendition gets generated. | 

### Other Parameters

Other parameters are passed through a pointer to a apiGenerateRenditionsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **xGenerateRenditions** | **string** | One or multiple of the supported rendition types separated by &#39;,&#39;. Supported rendition types are : [&#39;fullsize&#39;, &#39;2560&#39;]. | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **contentLength** | **int32** | Length in bytes of the content. | 

### Return type

[**GenerateRenditions202Response**](GenerateRenditions202Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetAsset

> GetAsset200Response GetAsset(ctx, catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).Execute()

Get a catalog asset



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
    catalogId := "catalogId_example" // string | Identifier of the catalog
    assetId := "assetId_example" // string | Identifier of the asset

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.GetAsset(context.Background(), catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.GetAsset``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GetAsset`: GetAsset200Response
    fmt.Fprintf(os.Stdout, "Response from `AssetsApi.GetAsset`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog | 
**assetId** | **string** | Identifier of the asset | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetAssetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 



### Return type

[**GetAsset200Response**](GetAsset200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetAssetExternalXmpDevelopSetting

> GetAssetExternalXmpDevelopSetting(ctx, catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).Execute()

Get latest asset external xmp develop setting



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
    catalogId := "catalogId_example" // string | Identifier of the catalog in which asset exists.
    assetId := "assetId_example" // string | Identifier of the asset for which to fetch rendition.

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.GetAssetExternalXmpDevelopSetting(context.Background(), catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.GetAssetExternalXmpDevelopSetting``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog in which asset exists. | 
**assetId** | **string** | Identifier of the asset for which to fetch rendition. | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetAssetExternalXmpDevelopSettingRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 



### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetAssetRendition

> GetAssetRendition(ctx, catalogId, assetId, renditionType).XAPIKey(xAPIKey).Authorization(authorization).Execute()

Get latest asset rendition



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
    catalogId := "catalogId_example" // string | Identifier of the catalog in which asset exists.
    assetId := "assetId_example" // string | Identifier of the asset for which to fetch rendition.
    renditionType := "renditionType_example" // string | One of the supported rendition types. Supported rendition types are : ['thumbnail2x', 'fullsize', '640', '1280', '2048', '2560'].

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.GetAssetRendition(context.Background(), catalogId, assetId, renditionType).XAPIKey(xAPIKey).Authorization(authorization).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.GetAssetRendition``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog in which asset exists. | 
**assetId** | **string** | Identifier of the asset for which to fetch rendition. | 
**renditionType** | **string** | One of the supported rendition types. Supported rendition types are : [&#39;thumbnail2x&#39;, &#39;fullsize&#39;, &#39;640&#39;, &#39;1280&#39;, &#39;2048&#39;, &#39;2560&#39;]. | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetAssetRenditionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 




### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetAssets

> GetAssets200Response GetAssets(ctx, catalogId).XAPIKey(xAPIKey).Authorization(authorization).UpdatedSince(updatedSince).CapturedBefore(capturedBefore).CapturedAfter(capturedAfter).Limit(limit).Sha256(sha256).HideStackedAssets(hideStackedAssets).Subtype(subtype).AssetIds(assetIds).Exclude(exclude).Group(group).Name(name).Favorite(favorite).Execute()

Retrieve assets



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
    catalogId := "catalogId_example" // string | Identifier of the catalog containing the album.
    updatedSince := "updatedSince_example" // string | Starting timestamp (optional)
    capturedBefore := "capturedBefore_example" // string | Used to request assets captured before a given time. captured_before will be found in the \"links.next.href\" link. If no links.next is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_before the last asset in the list (the client has reached the \"bottom\" of the list). captured_before may not be used in conjunction with captured_after. (optional)
    capturedAfter := "capturedAfter_example" // string | Used to request assets captured after a given time. captured_after will be found in the \"links.prev.href\" link. If no links.prev is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_after the first asset in the list (the client has reached the \"top\" of the list). Note: assets imported without a captureDate payload property default to the value \"0000-00-00T00:00:00\". To list these assets set captured_after to \"-0001-12-31T23:59:59\". captured_after may not be used in conjunction with captured_before. (optional)
    limit := int32(56) // int32 | Number of assets to return. Default value is 100. Maximum is 500. Please note that the response may contain more than 'limit' number of assets returned if the assets at the 'limit' boundary has the same capture_date. For example if there are 5 assets in a catalog and the 3rd, 4th and 5th assets all have the same capture dates the response will contain all 5 assets whether 'limit' is 3, 4 or 5. (optional)
    sha256 := "sha256_example" // string | SHA256 hash value of original file. Assets with a matching SHA256 hash will be returned. May be used in conjunction with subtype. (optional)
    hideStackedAssets := true // bool | To show or hide assets inside stacks in the catalog. If hide_stacked_assets is passed as true, assets inside stacks won't be returned. Default value is false. (optional)
    subtype := "subtype_example" // string | Semi-colon separated asset subtype values. (optional)
    assetIds := "assetIds_example" // string | Set of 1 - 100 comma separated asset_id values. Other parameters can not be used in conjunction with this parameter. (optional)
    exclude := "exclude_example" // string | Used to request the list for different types of assets excluding incomplete or complete image and video assets. The valid values are \"incomplete\" and \"complete\". An image or video asset is considered to be complete if its proxy or original upload exists. An asset of subtypes profile, preset, camera_profile or lens_profile is considered complete if its original upload exists. (optional)
    group := "group_example" // string | Semi-colon separated group values. Subtype parameter of \"preset\" or \"profile\" is required when using this parameter. (optional)
    name := "name_example" // string | Semi-colon separated name values. Subtype parameter of \"preset\" or \"profile\" is required when using this parameter. (optional)
    favorite := "favorite_example" // string | Favorite status, subtype parameter of \"preset\" is required when using this parameter. (optional)

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.GetAssets(context.Background(), catalogId).XAPIKey(xAPIKey).Authorization(authorization).UpdatedSince(updatedSince).CapturedBefore(capturedBefore).CapturedAfter(capturedAfter).Limit(limit).Sha256(sha256).HideStackedAssets(hideStackedAssets).Subtype(subtype).AssetIds(assetIds).Exclude(exclude).Group(group).Name(name).Favorite(favorite).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.GetAssets``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GetAssets`: GetAssets200Response
    fmt.Fprintf(os.Stdout, "Response from `AssetsApi.GetAssets`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetAssetsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 

 **updatedSince** | **string** | Starting timestamp | 
 **capturedBefore** | **string** | Used to request assets captured before a given time. captured_before will be found in the \&quot;links.next.href\&quot; link. If no links.next is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_before the last asset in the list (the client has reached the \&quot;bottom\&quot; of the list). captured_before may not be used in conjunction with captured_after. | 
 **capturedAfter** | **string** | Used to request assets captured after a given time. captured_after will be found in the \&quot;links.prev.href\&quot; link. If no links.prev is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_after the first asset in the list (the client has reached the \&quot;top\&quot; of the list). Note: assets imported without a captureDate payload property default to the value \&quot;0000-00-00T00:00:00\&quot;. To list these assets set captured_after to \&quot;-0001-12-31T23:59:59\&quot;. captured_after may not be used in conjunction with captured_before. | 
 **limit** | **int32** | Number of assets to return. Default value is 100. Maximum is 500. Please note that the response may contain more than &#39;limit&#39; number of assets returned if the assets at the &#39;limit&#39; boundary has the same capture_date. For example if there are 5 assets in a catalog and the 3rd, 4th and 5th assets all have the same capture dates the response will contain all 5 assets whether &#39;limit&#39; is 3, 4 or 5. | 
 **sha256** | **string** | SHA256 hash value of original file. Assets with a matching SHA256 hash will be returned. May be used in conjunction with subtype. | 
 **hideStackedAssets** | **bool** | To show or hide assets inside stacks in the catalog. If hide_stacked_assets is passed as true, assets inside stacks won&#39;t be returned. Default value is false. | 
 **subtype** | **string** | Semi-colon separated asset subtype values. | 
 **assetIds** | **string** | Set of 1 - 100 comma separated asset_id values. Other parameters can not be used in conjunction with this parameter. | 
 **exclude** | **string** | Used to request the list for different types of assets excluding incomplete or complete image and video assets. The valid values are \&quot;incomplete\&quot; and \&quot;complete\&quot;. An image or video asset is considered to be complete if its proxy or original upload exists. An asset of subtypes profile, preset, camera_profile or lens_profile is considered complete if its original upload exists. | 
 **group** | **string** | Semi-colon separated group values. Subtype parameter of \&quot;preset\&quot; or \&quot;profile\&quot; is required when using this parameter. | 
 **name** | **string** | Semi-colon separated name values. Subtype parameter of \&quot;preset\&quot; or \&quot;profile\&quot; is required when using this parameter. | 
 **favorite** | **string** | Favorite status, subtype parameter of \&quot;preset\&quot; is required when using this parameter. | 

### Return type

[**GetAssets200Response**](GetAssets200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PutAssetExternalXmpDevelopSetting

> PutAssetExternalXmpDevelopSetting(ctx, catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).ContentLength(contentLength).ContentType(contentType).PutAssetExternalXmpDevelopSettingRequest(putAssetExternalXmpDevelopSettingRequest).Execute()

Create asset external xmp develop setting file



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
    catalogId := "catalogId_example" // string | Identifier of the catalog in which the asset will be created.
    contentLength := int32(56) // int32 | Content length, in bytes. Current maximum size is 200 Mb.
    contentType := "contentType_example" // string | For uploading a new xmp/develop file content-type='application/rdf+xml' and for copying xmp/develop file from another asset content-type='application/json'
    assetId := "assetId_example" // string | Client-generated Lightroom unique identifier for the new asset.
    putAssetExternalXmpDevelopSettingRequest := *openapiclient.NewPutAssetExternalXmpDevelopSettingRequest() // PutAssetExternalXmpDevelopSettingRequest | The below request body example is for copying external xmp/develop file from another asset. (For upload external xmp/develop  case the body will be a xml string. Eg. '\\<xml.../xml\\>')

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AssetsApi.PutAssetExternalXmpDevelopSetting(context.Background(), catalogId, assetId).XAPIKey(xAPIKey).Authorization(authorization).ContentLength(contentLength).ContentType(contentType).PutAssetExternalXmpDevelopSettingRequest(putAssetExternalXmpDevelopSettingRequest).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AssetsApi.PutAssetExternalXmpDevelopSetting``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog in which the asset will be created. | 
**assetId** | **string** | Client-generated Lightroom unique identifier for the new asset. | 

### Other Parameters

Other parameters are passed through a pointer to a apiPutAssetExternalXmpDevelopSettingRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 

 **contentLength** | **int32** | Content length, in bytes. Current maximum size is 200 Mb. | 
 **contentType** | **string** | For uploading a new xmp/develop file content-type&#x3D;&#39;application/rdf+xml&#39; and for copying xmp/develop file from another asset content-type&#x3D;&#39;application/json&#39; | 

 **putAssetExternalXmpDevelopSettingRequest** | [**PutAssetExternalXmpDevelopSettingRequest**](PutAssetExternalXmpDevelopSettingRequest.md) | The below request body example is for copying external xmp/develop file from another asset. (For upload external xmp/develop  case the body will be a xml string. Eg. &#39;\\&lt;xml.../xml\\&gt;&#39;) | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

