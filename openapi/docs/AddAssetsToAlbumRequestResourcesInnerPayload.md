# AddAssetsToAlbumRequestResourcesInnerPayload

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Cover** | Pointer to **bool** | Whether this asset should be used as the album cover. | [optional] 
**Order** | Pointer to **string** |  | [optional] 
**PublishInfo** | Pointer to [**AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo**](AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo.md) |  | [optional] 

## Methods

### NewAddAssetsToAlbumRequestResourcesInnerPayload

`func NewAddAssetsToAlbumRequestResourcesInnerPayload() *AddAssetsToAlbumRequestResourcesInnerPayload`

NewAddAssetsToAlbumRequestResourcesInnerPayload instantiates a new AddAssetsToAlbumRequestResourcesInnerPayload object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddAssetsToAlbumRequestResourcesInnerPayloadWithDefaults

`func NewAddAssetsToAlbumRequestResourcesInnerPayloadWithDefaults() *AddAssetsToAlbumRequestResourcesInnerPayload`

NewAddAssetsToAlbumRequestResourcesInnerPayloadWithDefaults instantiates a new AddAssetsToAlbumRequestResourcesInnerPayload object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCover

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) GetCover() bool`

GetCover returns the Cover field if non-nil, zero value otherwise.

### GetCoverOk

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) GetCoverOk() (*bool, bool)`

GetCoverOk returns a tuple with the Cover field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCover

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) SetCover(v bool)`

SetCover sets Cover field to given value.

### HasCover

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) HasCover() bool`

HasCover returns a boolean if a field has been set.

### GetOrder

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) GetOrder() string`

GetOrder returns the Order field if non-nil, zero value otherwise.

### GetOrderOk

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) GetOrderOk() (*string, bool)`

GetOrderOk returns a tuple with the Order field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOrder

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) SetOrder(v string)`

SetOrder sets Order field to given value.

### HasOrder

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) HasOrder() bool`

HasOrder returns a boolean if a field has been set.

### GetPublishInfo

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) GetPublishInfo() AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo`

GetPublishInfo returns the PublishInfo field if non-nil, zero value otherwise.

### GetPublishInfoOk

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) GetPublishInfoOk() (*AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo, bool)`

GetPublishInfoOk returns a tuple with the PublishInfo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublishInfo

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) SetPublishInfo(v AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo)`

SetPublishInfo sets PublishInfo field to given value.

### HasPublishInfo

`func (o *AddAssetsToAlbumRequestResourcesInnerPayload) HasPublishInfo() bool`

HasPublishInfo returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


