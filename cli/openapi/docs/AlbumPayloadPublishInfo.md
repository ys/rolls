# AlbumPayloadPublishInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ServicePayload** | Pointer to **string** | Album metadata, unique to the service, encapsulated as a single string with a maximum length of 1024 characters. | [optional] 
**RemoteId** | Pointer to **string** | Identifier for the album that is unique to the publishing service. | [optional] 
**Created** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Updated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Deleted** | Pointer to **bool** | True if the externally affiliated content (identified by remoteId) was deleted; acts as a tombstone. | [optional] 
**RemoteLinks** | Pointer to [**AlbumPayloadPublishInfoRemoteLinks**](AlbumPayloadPublishInfoRemoteLinks.md) |  | [optional] 

## Methods

### NewAlbumPayloadPublishInfo

`func NewAlbumPayloadPublishInfo() *AlbumPayloadPublishInfo`

NewAlbumPayloadPublishInfo instantiates a new AlbumPayloadPublishInfo object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAlbumPayloadPublishInfoWithDefaults

`func NewAlbumPayloadPublishInfoWithDefaults() *AlbumPayloadPublishInfo`

NewAlbumPayloadPublishInfoWithDefaults instantiates a new AlbumPayloadPublishInfo object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetServicePayload

`func (o *AlbumPayloadPublishInfo) GetServicePayload() string`

GetServicePayload returns the ServicePayload field if non-nil, zero value otherwise.

### GetServicePayloadOk

`func (o *AlbumPayloadPublishInfo) GetServicePayloadOk() (*string, bool)`

GetServicePayloadOk returns a tuple with the ServicePayload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServicePayload

`func (o *AlbumPayloadPublishInfo) SetServicePayload(v string)`

SetServicePayload sets ServicePayload field to given value.

### HasServicePayload

`func (o *AlbumPayloadPublishInfo) HasServicePayload() bool`

HasServicePayload returns a boolean if a field has been set.

### GetRemoteId

`func (o *AlbumPayloadPublishInfo) GetRemoteId() string`

GetRemoteId returns the RemoteId field if non-nil, zero value otherwise.

### GetRemoteIdOk

`func (o *AlbumPayloadPublishInfo) GetRemoteIdOk() (*string, bool)`

GetRemoteIdOk returns a tuple with the RemoteId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRemoteId

`func (o *AlbumPayloadPublishInfo) SetRemoteId(v string)`

SetRemoteId sets RemoteId field to given value.

### HasRemoteId

`func (o *AlbumPayloadPublishInfo) HasRemoteId() bool`

HasRemoteId returns a boolean if a field has been set.

### GetCreated

`func (o *AlbumPayloadPublishInfo) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *AlbumPayloadPublishInfo) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *AlbumPayloadPublishInfo) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *AlbumPayloadPublishInfo) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *AlbumPayloadPublishInfo) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *AlbumPayloadPublishInfo) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *AlbumPayloadPublishInfo) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *AlbumPayloadPublishInfo) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetDeleted

`func (o *AlbumPayloadPublishInfo) GetDeleted() bool`

GetDeleted returns the Deleted field if non-nil, zero value otherwise.

### GetDeletedOk

`func (o *AlbumPayloadPublishInfo) GetDeletedOk() (*bool, bool)`

GetDeletedOk returns a tuple with the Deleted field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeleted

`func (o *AlbumPayloadPublishInfo) SetDeleted(v bool)`

SetDeleted sets Deleted field to given value.

### HasDeleted

`func (o *AlbumPayloadPublishInfo) HasDeleted() bool`

HasDeleted returns a boolean if a field has been set.

### GetRemoteLinks

`func (o *AlbumPayloadPublishInfo) GetRemoteLinks() AlbumPayloadPublishInfoRemoteLinks`

GetRemoteLinks returns the RemoteLinks field if non-nil, zero value otherwise.

### GetRemoteLinksOk

`func (o *AlbumPayloadPublishInfo) GetRemoteLinksOk() (*AlbumPayloadPublishInfoRemoteLinks, bool)`

GetRemoteLinksOk returns a tuple with the RemoteLinks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRemoteLinks

`func (o *AlbumPayloadPublishInfo) SetRemoteLinks(v AlbumPayloadPublishInfoRemoteLinks)`

SetRemoteLinks sets RemoteLinks field to given value.

### HasRemoteLinks

`func (o *AlbumPayloadPublishInfo) HasRemoteLinks() bool`

HasRemoteLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


