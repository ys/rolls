# ListAssetsOfAlbum200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Album** | Pointer to [**ListAssetsOfAlbum200ResponseAlbum**](ListAssetsOfAlbum200ResponseAlbum.md) |  | [optional] 
**Resources** | Pointer to [**[]ListAssetsOfAlbum200ResponseResourcesInner**](ListAssetsOfAlbum200ResponseResourcesInner.md) |  | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewListAssetsOfAlbum200Response

`func NewListAssetsOfAlbum200Response() *ListAssetsOfAlbum200Response`

NewListAssetsOfAlbum200Response instantiates a new ListAssetsOfAlbum200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListAssetsOfAlbum200ResponseWithDefaults

`func NewListAssetsOfAlbum200ResponseWithDefaults() *ListAssetsOfAlbum200Response`

NewListAssetsOfAlbum200ResponseWithDefaults instantiates a new ListAssetsOfAlbum200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *ListAssetsOfAlbum200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *ListAssetsOfAlbum200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *ListAssetsOfAlbum200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *ListAssetsOfAlbum200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetAlbum

`func (o *ListAssetsOfAlbum200Response) GetAlbum() ListAssetsOfAlbum200ResponseAlbum`

GetAlbum returns the Album field if non-nil, zero value otherwise.

### GetAlbumOk

`func (o *ListAssetsOfAlbum200Response) GetAlbumOk() (*ListAssetsOfAlbum200ResponseAlbum, bool)`

GetAlbumOk returns a tuple with the Album field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAlbum

`func (o *ListAssetsOfAlbum200Response) SetAlbum(v ListAssetsOfAlbum200ResponseAlbum)`

SetAlbum sets Album field to given value.

### HasAlbum

`func (o *ListAssetsOfAlbum200Response) HasAlbum() bool`

HasAlbum returns a boolean if a field has been set.

### GetResources

`func (o *ListAssetsOfAlbum200Response) GetResources() []ListAssetsOfAlbum200ResponseResourcesInner`

GetResources returns the Resources field if non-nil, zero value otherwise.

### GetResourcesOk

`func (o *ListAssetsOfAlbum200Response) GetResourcesOk() (*[]ListAssetsOfAlbum200ResponseResourcesInner, bool)`

GetResourcesOk returns a tuple with the Resources field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResources

`func (o *ListAssetsOfAlbum200Response) SetResources(v []ListAssetsOfAlbum200ResponseResourcesInner)`

SetResources sets Resources field to given value.

### HasResources

`func (o *ListAssetsOfAlbum200Response) HasResources() bool`

HasResources returns a boolean if a field has been set.

### GetLinks

`func (o *ListAssetsOfAlbum200Response) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *ListAssetsOfAlbum200Response) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *ListAssetsOfAlbum200Response) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *ListAssetsOfAlbum200Response) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


