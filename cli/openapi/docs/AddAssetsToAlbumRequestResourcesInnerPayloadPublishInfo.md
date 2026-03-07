# AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ServicePayload** | Pointer to **string** | Album asset metadata, unique to the service, encapsulated as a single string with a maximum length of 1024 characters. | [optional] 
**RemoteId** | Pointer to **string** | Identifier for the album asset that is unique to the publishing service. | [optional] 

## Methods

### NewAddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo

`func NewAddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo() *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo`

NewAddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo instantiates a new AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddAssetsToAlbumRequestResourcesInnerPayloadPublishInfoWithDefaults

`func NewAddAssetsToAlbumRequestResourcesInnerPayloadPublishInfoWithDefaults() *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo`

NewAddAssetsToAlbumRequestResourcesInnerPayloadPublishInfoWithDefaults instantiates a new AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetServicePayload

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) GetServicePayload() string`

GetServicePayload returns the ServicePayload field if non-nil, zero value otherwise.

### GetServicePayloadOk

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) GetServicePayloadOk() (*string, bool)`

GetServicePayloadOk returns a tuple with the ServicePayload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServicePayload

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) SetServicePayload(v string)`

SetServicePayload sets ServicePayload field to given value.

### HasServicePayload

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) HasServicePayload() bool`

HasServicePayload returns a boolean if a field has been set.

### GetRemoteId

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) GetRemoteId() string`

GetRemoteId returns the RemoteId field if non-nil, zero value otherwise.

### GetRemoteIdOk

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) GetRemoteIdOk() (*string, bool)`

GetRemoteIdOk returns a tuple with the RemoteId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRemoteId

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) SetRemoteId(v string)`

SetRemoteId sets RemoteId field to given value.

### HasRemoteId

`func (o *AddAssetsToAlbumRequestResourcesInnerPayloadPublishInfo) HasRemoteId() bool`

HasRemoteId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


