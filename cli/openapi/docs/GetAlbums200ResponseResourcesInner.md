# GetAlbums200ResponseResourcesInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Created** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Updated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Type** | Pointer to **string** |  | [optional] 
**Subtype** | Pointer to **string** |  | [optional] 
**ServiceId** | Pointer to **string** | The API Key (client identifier) of the service affiliated with the album. | [optional] 
**Payload** | Pointer to [**AlbumPayload**](AlbumPayload.md) |  | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewGetAlbums200ResponseResourcesInner

`func NewGetAlbums200ResponseResourcesInner() *GetAlbums200ResponseResourcesInner`

NewGetAlbums200ResponseResourcesInner instantiates a new GetAlbums200ResponseResourcesInner object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAlbums200ResponseResourcesInnerWithDefaults

`func NewGetAlbums200ResponseResourcesInnerWithDefaults() *GetAlbums200ResponseResourcesInner`

NewGetAlbums200ResponseResourcesInnerWithDefaults instantiates a new GetAlbums200ResponseResourcesInner object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *GetAlbums200ResponseResourcesInner) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *GetAlbums200ResponseResourcesInner) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *GetAlbums200ResponseResourcesInner) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *GetAlbums200ResponseResourcesInner) HasId() bool`

HasId returns a boolean if a field has been set.

### GetCreated

`func (o *GetAlbums200ResponseResourcesInner) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *GetAlbums200ResponseResourcesInner) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *GetAlbums200ResponseResourcesInner) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *GetAlbums200ResponseResourcesInner) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *GetAlbums200ResponseResourcesInner) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *GetAlbums200ResponseResourcesInner) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *GetAlbums200ResponseResourcesInner) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *GetAlbums200ResponseResourcesInner) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetType

`func (o *GetAlbums200ResponseResourcesInner) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *GetAlbums200ResponseResourcesInner) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *GetAlbums200ResponseResourcesInner) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *GetAlbums200ResponseResourcesInner) HasType() bool`

HasType returns a boolean if a field has been set.

### GetSubtype

`func (o *GetAlbums200ResponseResourcesInner) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *GetAlbums200ResponseResourcesInner) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *GetAlbums200ResponseResourcesInner) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *GetAlbums200ResponseResourcesInner) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetServiceId

`func (o *GetAlbums200ResponseResourcesInner) GetServiceId() string`

GetServiceId returns the ServiceId field if non-nil, zero value otherwise.

### GetServiceIdOk

`func (o *GetAlbums200ResponseResourcesInner) GetServiceIdOk() (*string, bool)`

GetServiceIdOk returns a tuple with the ServiceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServiceId

`func (o *GetAlbums200ResponseResourcesInner) SetServiceId(v string)`

SetServiceId sets ServiceId field to given value.

### HasServiceId

`func (o *GetAlbums200ResponseResourcesInner) HasServiceId() bool`

HasServiceId returns a boolean if a field has been set.

### GetPayload

`func (o *GetAlbums200ResponseResourcesInner) GetPayload() AlbumPayload`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *GetAlbums200ResponseResourcesInner) GetPayloadOk() (*AlbumPayload, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *GetAlbums200ResponseResourcesInner) SetPayload(v AlbumPayload)`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *GetAlbums200ResponseResourcesInner) HasPayload() bool`

HasPayload returns a boolean if a field has been set.

### GetLinks

`func (o *GetAlbums200ResponseResourcesInner) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *GetAlbums200ResponseResourcesInner) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *GetAlbums200ResponseResourcesInner) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *GetAlbums200ResponseResourcesInner) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


