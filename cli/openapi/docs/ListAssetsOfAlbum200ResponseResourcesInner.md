# ListAssetsOfAlbum200ResponseResourcesInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Type** | Pointer to **string** |  | [optional] 
**Created** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Updated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 
**Asset** | Pointer to [**ListAssetsOfAlbum200ResponseResourcesInnerAsset**](ListAssetsOfAlbum200ResponseResourcesInnerAsset.md) |  | [optional] 

## Methods

### NewListAssetsOfAlbum200ResponseResourcesInner

`func NewListAssetsOfAlbum200ResponseResourcesInner() *ListAssetsOfAlbum200ResponseResourcesInner`

NewListAssetsOfAlbum200ResponseResourcesInner instantiates a new ListAssetsOfAlbum200ResponseResourcesInner object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListAssetsOfAlbum200ResponseResourcesInnerWithDefaults

`func NewListAssetsOfAlbum200ResponseResourcesInnerWithDefaults() *ListAssetsOfAlbum200ResponseResourcesInner`

NewListAssetsOfAlbum200ResponseResourcesInnerWithDefaults instantiates a new ListAssetsOfAlbum200ResponseResourcesInner object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasId() bool`

HasId returns a boolean if a field has been set.

### GetType

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasType() bool`

HasType returns a boolean if a field has been set.

### GetCreated

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetLinks

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasLinks() bool`

HasLinks returns a boolean if a field has been set.

### GetAsset

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetAsset() ListAssetsOfAlbum200ResponseResourcesInnerAsset`

GetAsset returns the Asset field if non-nil, zero value otherwise.

### GetAssetOk

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetAssetOk() (*ListAssetsOfAlbum200ResponseResourcesInnerAsset, bool)`

GetAssetOk returns a tuple with the Asset field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAsset

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetAsset(v ListAssetsOfAlbum200ResponseResourcesInnerAsset)`

SetAsset sets Asset field to given value.

### HasAsset

`func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasAsset() bool`

HasAsset returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


