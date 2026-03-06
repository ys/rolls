# \AlbumsApi

All URIs are relative to *https://lr.adobe.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AddAssetsToAlbum**](AlbumsApi.md#AddAssetsToAlbum) | **Put** /v2/catalogs/{catalog_id}/albums/{album_id}/assets | Add assets to album
[**CreateAlbum**](AlbumsApi.md#CreateAlbum) | **Put** /v2/catalogs/{catalog_id}/albums/{album_id} | Create album
[**DeleteAlbum**](AlbumsApi.md#DeleteAlbum) | **Delete** /v2/catalogs/{catalog_id}/albums/{album_id} | Delete album
[**GetAlbums**](AlbumsApi.md#GetAlbums) | **Get** /v2/catalogs/{catalog_id}/albums | Retrieve albums
[**ListAssetsOfAlbum**](AlbumsApi.md#ListAssetsOfAlbum) | **Get** /v2/catalogs/{catalog_id}/albums/{album_id}/assets | List assets of an album
[**ReadAlbum**](AlbumsApi.md#ReadAlbum) | **Get** /v2/catalogs/{catalog_id}/albums/{album_id} | Get album
[**UpdateAlbum**](AlbumsApi.md#UpdateAlbum) | **Post** /v2/catalogs/{catalog_id}/albums/{album_id} | Update album



## AddAssetsToAlbum

> AddAssetsToAlbum201Response AddAssetsToAlbum(ctx, catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).AddAssetsToAlbumRequest(addAssetsToAlbumRequest).Execute()

Add assets to album



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
    albumId := "albumId_example" // string | Identifier of the album.
    addAssetsToAlbumRequest := *openapiclient.NewAddAssetsToAlbumRequest() // AddAssetsToAlbumRequest | Album asset metadata and information.

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.AddAssetsToAlbum(context.Background(), catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).AddAssetsToAlbumRequest(addAssetsToAlbumRequest).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.AddAssetsToAlbum``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `AddAssetsToAlbum`: AddAssetsToAlbum201Response
    fmt.Fprintf(os.Stdout, "Response from `AlbumsApi.AddAssetsToAlbum`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 
**albumId** | **string** | Identifier of the album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiAddAssetsToAlbumRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **addAssetsToAlbumRequest** | [**AddAssetsToAlbumRequest**](AddAssetsToAlbumRequest.md) | Album asset metadata and information. | 

### Return type

[**AddAssetsToAlbum201Response**](AddAssetsToAlbum201Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateAlbum

> CreateAlbum(ctx, catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).CreateAlbumRequest(createAlbumRequest).Execute()

Create album



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
    albumId := "albumId_example" // string | Client-generated Lightroom unique identifier for the new album.
    createAlbumRequest := *openapiclient.NewCreateAlbumRequest() // CreateAlbumRequest | Initial album metadata and information.

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.CreateAlbum(context.Background(), catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).CreateAlbumRequest(createAlbumRequest).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.CreateAlbum``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 
**albumId** | **string** | Client-generated Lightroom unique identifier for the new album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiCreateAlbumRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **createAlbumRequest** | [**CreateAlbumRequest**](CreateAlbumRequest.md) | Initial album metadata and information. | 

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


## DeleteAlbum

> DeleteAlbum(ctx, catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).ChildAlbums(childAlbums).Execute()

Delete album



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
    albumId := "albumId_example" // string | Identifier for the album.
    childAlbums := "childAlbums_example" // string | This parameter when passed with a value, for example: true would delete all the child albums as well of the album specified. The deletion of child albums will be done asynchronously. (optional)

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.DeleteAlbum(context.Background(), catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).ChildAlbums(childAlbums).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.DeleteAlbum``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 
**albumId** | **string** | Identifier for the album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteAlbumRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **childAlbums** | **string** | This parameter when passed with a value, for example: true would delete all the child albums as well of the album specified. The deletion of child albums will be done asynchronously. | 

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


## GetAlbums

> GetAlbums200Response GetAlbums(ctx, catalogId).XAPIKey(xAPIKey).Authorization(authorization).Subtype(subtype).NameAfter(nameAfter).Limit(limit).Execute()

Retrieve albums



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
    subtype := "subtype_example" // string | Comma-separated list of subtypes to enumerate. Subtype can be one of 'project' or 'project_set'. (optional)
    nameAfter := "nameAfter_example" // string | UTF-8 string representing the name of the album that should precede the current page of results. In other words, the response will contain result with names greater than the 'name_after' value using standard string ordering relations. (optional)
    limit := int32(56) // int32 | Number of albums to return. Default value is 100. Please note that the response may contain more than 'limit' number of albums returned if multiple albums at the 'limit' boundary have the same name_after. (optional)

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.GetAlbums(context.Background(), catalogId).XAPIKey(xAPIKey).Authorization(authorization).Subtype(subtype).NameAfter(nameAfter).Limit(limit).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.GetAlbums``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `GetAlbums`: GetAlbums200Response
    fmt.Fprintf(os.Stdout, "Response from `AlbumsApi.GetAlbums`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetAlbumsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 

 **subtype** | **string** | Comma-separated list of subtypes to enumerate. Subtype can be one of &#39;project&#39; or &#39;project_set&#39;. | 
 **nameAfter** | **string** | UTF-8 string representing the name of the album that should precede the current page of results. In other words, the response will contain result with names greater than the &#39;name_after&#39; value using standard string ordering relations. | 
 **limit** | **int32** | Number of albums to return. Default value is 100. Please note that the response may contain more than &#39;limit&#39; number of albums returned if multiple albums at the &#39;limit&#39; boundary have the same name_after. | 

### Return type

[**GetAlbums200Response**](GetAlbums200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListAssetsOfAlbum

> ListAssetsOfAlbum200Response ListAssetsOfAlbum(ctx, catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).CapturedBefore(capturedBefore).CapturedAfter(capturedAfter).OrderAfter(orderAfter).OrderBefore(orderBefore).Limit(limit).HideStackedAssets(hideStackedAssets).Subtype(subtype).Flag(flag).Embed(embed).Exclude(exclude).AssetIds(assetIds).AlbumFilters(albumFilters).Execute()

List assets of an album



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
    albumId := "albumId_example" // string | Identifier of the album.
    capturedBefore := "capturedBefore_example" // string | Used to request assets captured before a given time. captured_before will be found in the \"links.next.href\" link. If no links.next is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_before the last asset in the list (the client has reached the \"bottom\" of the list). captured_before may not be used in conjunction with captured_after. (optional)
    capturedAfter := "capturedAfter_example" // string | Used to request assets captured after a given time. captured_after will be found in the \"links.prev.href\" link. If no links.prev is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_after the first asset in the list (the client has reached the \"top\" of the list). Note: assets imported without a captureDate payload property default to the value \"0000-00-00T00:00:00\". To list these assets set captured_after to \"-0001-12-31T23:59:59\". captured_after may not be used in conjunction with captured_before. (optional)
    orderAfter := "orderAfter_example" // string | Used to request assets having order value greater than specified value. Next and previous pages will be found in the \"links.next.href\" and \"links.prev.href\" links respectively. If next/prev link is missing, it indicates that there is no next/prev page. Some rules about using order_after: 1) Specify \"-\" to get the first page. 2) Can be max of 1024 characters. 3) Should be a lex64 sort order string with characters in the set: [-0-9A-Z_a-z] with sort order in the same sequence as in the set [-0-9A-Z_a-z]. 4) captured_before cannot be used with order_after 5) captured_after can be used only if order_after==\"\" (optional)
    orderBefore := "orderBefore_example" // string | Used to request assets having order value lesser than specified value. Next and previous pages will be found in the \"links.next.href\" and \"links.prev.href\" links respectively. If next/prev link is missing, it indicates that there is no next/prev page. Some rules about using order_before: 1) Specify order_before as \"\" and captured_before as a future date to get the first page. 2) Can be max of 1024 characters. 3) Should be a lex64 sort order string with characters in the set: [-0-9A-Z_a-z] with sort order in the same sequence as in the set [-0-9A-Z_a-z]. 4) captured_after cannot be used with order_before 5) captured_before can be used only if order_before==\"\" (optional)
    limit := int32(56) // int32 | Number of assets to return. Default value is 100. Maximum is 500. Please note that the response may contain more than 'limit' number of assets returned if the assets at the 'limit' boundary has the same capture_date. For example if there are 5 assets in a catalog and the 3rd, 4th and 5th assets all have the same capture dates the response will contain all 5 assets whether 'limit' is 3, 4 or 5. (optional)
    hideStackedAssets := true // bool | To show or hide assets inside stacks in the catalog. If hide_stacked_assets is passed as true, assets inside stacks won't be returned. Default value is false. (optional)
    subtype := "subtype_example" // string | Semi-colon separated asset subtype values. (optional)
    flag := "flag_example" // string | Semi-colon separated review flag values used to filter assets returned. Can be combined with subtype filter. Valid values for flags are 'pick', 'unflagged' and 'reject'. This parameter cannot be used along with album_filters parameter. Default behavior is to display all assets. (optional)
    embed := "embed_example" // string | Semicolon-delimited list of additional data to include. When the list includes \"asset\", the asset subdocuments contains all the fields. Otherwise, only the id and self href link are returned in the asset subdocuments. (optional)
    exclude := "exclude_example" // string | Used to request the list for different types of assets excluding incomplete or complete image and video assets. The valid values are \"incomplete\" and \"complete\". An image or video asset is considered to be complete if its proxy or original upload exists. An asset of subtypes profile, preset, camera_profile or lens_profile is considered complete if its original upload exists. (optional)
    assetIds := "assetIds_example" // string | Set of 1 - 100 comma separated asset_id values. Other parameters can not be used in conjunction with this parameter. (optional)
    albumFilters := "albumFilters_example" // string | When album_filters is set to 'true', it filters out all the album assets based on the presentation filters set on the album. With this parameter, rejected assets always get filtered out irrespective of settings in presentation filters. Presentation filters are not applied when any value other than 'true' is set for album_filters. Default behavior is to display all assets. This parameter cannot be used along with flag parameter.  no Response: 200 OK (optional)

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.ListAssetsOfAlbum(context.Background(), catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).CapturedBefore(capturedBefore).CapturedAfter(capturedAfter).OrderAfter(orderAfter).OrderBefore(orderBefore).Limit(limit).HideStackedAssets(hideStackedAssets).Subtype(subtype).Flag(flag).Embed(embed).Exclude(exclude).AssetIds(assetIds).AlbumFilters(albumFilters).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.ListAssetsOfAlbum``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `ListAssetsOfAlbum`: ListAssetsOfAlbum200Response
    fmt.Fprintf(os.Stdout, "Response from `AlbumsApi.ListAssetsOfAlbum`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 
**albumId** | **string** | Identifier of the album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiListAssetsOfAlbumRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **capturedBefore** | **string** | Used to request assets captured before a given time. captured_before will be found in the \&quot;links.next.href\&quot; link. If no links.next is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_before the last asset in the list (the client has reached the \&quot;bottom\&quot; of the list). captured_before may not be used in conjunction with captured_after. | 
 **capturedAfter** | **string** | Used to request assets captured after a given time. captured_after will be found in the \&quot;links.prev.href\&quot; link. If no links.prev is included in a listing response, this is a hint from the server that there are no assets in the catalog with a date captured_after the first asset in the list (the client has reached the \&quot;top\&quot; of the list). Note: assets imported without a captureDate payload property default to the value \&quot;0000-00-00T00:00:00\&quot;. To list these assets set captured_after to \&quot;-0001-12-31T23:59:59\&quot;. captured_after may not be used in conjunction with captured_before. | 
 **orderAfter** | **string** | Used to request assets having order value greater than specified value. Next and previous pages will be found in the \&quot;links.next.href\&quot; and \&quot;links.prev.href\&quot; links respectively. If next/prev link is missing, it indicates that there is no next/prev page. Some rules about using order_after: 1) Specify \&quot;-\&quot; to get the first page. 2) Can be max of 1024 characters. 3) Should be a lex64 sort order string with characters in the set: [-0-9A-Z_a-z] with sort order in the same sequence as in the set [-0-9A-Z_a-z]. 4) captured_before cannot be used with order_after 5) captured_after can be used only if order_after&#x3D;&#x3D;\&quot;\&quot; | 
 **orderBefore** | **string** | Used to request assets having order value lesser than specified value. Next and previous pages will be found in the \&quot;links.next.href\&quot; and \&quot;links.prev.href\&quot; links respectively. If next/prev link is missing, it indicates that there is no next/prev page. Some rules about using order_before: 1) Specify order_before as \&quot;\&quot; and captured_before as a future date to get the first page. 2) Can be max of 1024 characters. 3) Should be a lex64 sort order string with characters in the set: [-0-9A-Z_a-z] with sort order in the same sequence as in the set [-0-9A-Z_a-z]. 4) captured_after cannot be used with order_before 5) captured_before can be used only if order_before&#x3D;&#x3D;\&quot;\&quot; | 
 **limit** | **int32** | Number of assets to return. Default value is 100. Maximum is 500. Please note that the response may contain more than &#39;limit&#39; number of assets returned if the assets at the &#39;limit&#39; boundary has the same capture_date. For example if there are 5 assets in a catalog and the 3rd, 4th and 5th assets all have the same capture dates the response will contain all 5 assets whether &#39;limit&#39; is 3, 4 or 5. | 
 **hideStackedAssets** | **bool** | To show or hide assets inside stacks in the catalog. If hide_stacked_assets is passed as true, assets inside stacks won&#39;t be returned. Default value is false. | 
 **subtype** | **string** | Semi-colon separated asset subtype values. | 
 **flag** | **string** | Semi-colon separated review flag values used to filter assets returned. Can be combined with subtype filter. Valid values for flags are &#39;pick&#39;, &#39;unflagged&#39; and &#39;reject&#39;. This parameter cannot be used along with album_filters parameter. Default behavior is to display all assets. | 
 **embed** | **string** | Semicolon-delimited list of additional data to include. When the list includes \&quot;asset\&quot;, the asset subdocuments contains all the fields. Otherwise, only the id and self href link are returned in the asset subdocuments. | 
 **exclude** | **string** | Used to request the list for different types of assets excluding incomplete or complete image and video assets. The valid values are \&quot;incomplete\&quot; and \&quot;complete\&quot;. An image or video asset is considered to be complete if its proxy or original upload exists. An asset of subtypes profile, preset, camera_profile or lens_profile is considered complete if its original upload exists. | 
 **assetIds** | **string** | Set of 1 - 100 comma separated asset_id values. Other parameters can not be used in conjunction with this parameter. | 
 **albumFilters** | **string** | When album_filters is set to &#39;true&#39;, it filters out all the album assets based on the presentation filters set on the album. With this parameter, rejected assets always get filtered out irrespective of settings in presentation filters. Presentation filters are not applied when any value other than &#39;true&#39; is set for album_filters. Default behavior is to display all assets. This parameter cannot be used along with flag parameter.  no Response: 200 OK | 

### Return type

[**ListAssetsOfAlbum200Response**](ListAssetsOfAlbum200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ReadAlbum

> ReadAlbum200Response ReadAlbum(ctx, catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).Execute()

Get album



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
    albumId := "albumId_example" // string | Client-generated Lightroom unique identifier for the new album.

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.ReadAlbum(context.Background(), catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.ReadAlbum``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
    // response from `ReadAlbum`: ReadAlbum200Response
    fmt.Fprintf(os.Stdout, "Response from `AlbumsApi.ReadAlbum`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 
**albumId** | **string** | Client-generated Lightroom unique identifier for the new album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiReadAlbumRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 



### Return type

[**ReadAlbum200Response**](ReadAlbum200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateAlbum

> UpdateAlbum(ctx, catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).UpdateAlbumRequest(updateAlbumRequest).Execute()

Update album



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
    albumId := "albumId_example" // string | Identifier for the album.
    updateAlbumRequest := *openapiclient.NewUpdateAlbumRequest() // UpdateAlbumRequest | Album metadata and information to be updated.

    configuration := openapiclient.NewConfiguration()
    apiClient := openapiclient.NewAPIClient(configuration)
    resp, r, err := apiClient.AlbumsApi.UpdateAlbum(context.Background(), catalogId, albumId).XAPIKey(xAPIKey).Authorization(authorization).UpdateAlbumRequest(updateAlbumRequest).Execute()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error when calling `AlbumsApi.UpdateAlbum``: %v\n", err)
        fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
    }
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**catalogId** | **string** | Identifier of the catalog containing the album. | 
**albumId** | **string** | Identifier for the album. | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateAlbumRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIKey** | **string** | Client ID (API Key) which is subscribed to the Lightroom APIs through console.adobe.io | 
 **authorization** | **string** | Bearer [token] - User access token of an authenticated Lightroom customer | 


 **updateAlbumRequest** | [**UpdateAlbumRequest**](UpdateAlbumRequest.md) | Album metadata and information to be updated. | 

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

