# CreateAlbumRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Subtype** | Pointer to **string** |  | [optional] 
**ServiceId** | Pointer to **string** | The API Key (client identifier) of the service creating the album. | [optional] 
**Payload** | Pointer to [**AlbumPayload**](AlbumPayload.md) |  | [optional] 

## Methods

### NewCreateAlbumRequest

`func NewCreateAlbumRequest() *CreateAlbumRequest`

NewCreateAlbumRequest instantiates a new CreateAlbumRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAlbumRequestWithDefaults

`func NewCreateAlbumRequestWithDefaults() *CreateAlbumRequest`

NewCreateAlbumRequestWithDefaults instantiates a new CreateAlbumRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSubtype

`func (o *CreateAlbumRequest) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *CreateAlbumRequest) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *CreateAlbumRequest) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *CreateAlbumRequest) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetServiceId

`func (o *CreateAlbumRequest) GetServiceId() string`

GetServiceId returns the ServiceId field if non-nil, zero value otherwise.

### GetServiceIdOk

`func (o *CreateAlbumRequest) GetServiceIdOk() (*string, bool)`

GetServiceIdOk returns a tuple with the ServiceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServiceId

`func (o *CreateAlbumRequest) SetServiceId(v string)`

SetServiceId sets ServiceId field to given value.

### HasServiceId

`func (o *CreateAlbumRequest) HasServiceId() bool`

HasServiceId returns a boolean if a field has been set.

### GetPayload

`func (o *CreateAlbumRequest) GetPayload() AlbumPayload`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *CreateAlbumRequest) GetPayloadOk() (*AlbumPayload, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *CreateAlbumRequest) SetPayload(v AlbumPayload)`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *CreateAlbumRequest) HasPayload() bool`

HasPayload returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


