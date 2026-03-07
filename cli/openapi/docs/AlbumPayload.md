# AlbumPayload

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**UserCreated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**UserUpdated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Name** | Pointer to **string** |  | [optional] 
**Cover** | Pointer to [**AlbumPayloadCover**](AlbumPayloadCover.md) |  | [optional] 
**Parent** | Pointer to [**AlbumPayloadCover**](AlbumPayloadCover.md) |  | [optional] 
**PublishInfo** | Pointer to [**AlbumPayloadPublishInfo**](AlbumPayloadPublishInfo.md) |  | [optional] 

## Methods

### NewAlbumPayload

`func NewAlbumPayload() *AlbumPayload`

NewAlbumPayload instantiates a new AlbumPayload object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAlbumPayloadWithDefaults

`func NewAlbumPayloadWithDefaults() *AlbumPayload`

NewAlbumPayloadWithDefaults instantiates a new AlbumPayload object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUserCreated

`func (o *AlbumPayload) GetUserCreated() string`

GetUserCreated returns the UserCreated field if non-nil, zero value otherwise.

### GetUserCreatedOk

`func (o *AlbumPayload) GetUserCreatedOk() (*string, bool)`

GetUserCreatedOk returns a tuple with the UserCreated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserCreated

`func (o *AlbumPayload) SetUserCreated(v string)`

SetUserCreated sets UserCreated field to given value.

### HasUserCreated

`func (o *AlbumPayload) HasUserCreated() bool`

HasUserCreated returns a boolean if a field has been set.

### GetUserUpdated

`func (o *AlbumPayload) GetUserUpdated() string`

GetUserUpdated returns the UserUpdated field if non-nil, zero value otherwise.

### GetUserUpdatedOk

`func (o *AlbumPayload) GetUserUpdatedOk() (*string, bool)`

GetUserUpdatedOk returns a tuple with the UserUpdated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserUpdated

`func (o *AlbumPayload) SetUserUpdated(v string)`

SetUserUpdated sets UserUpdated field to given value.

### HasUserUpdated

`func (o *AlbumPayload) HasUserUpdated() bool`

HasUserUpdated returns a boolean if a field has been set.

### GetName

`func (o *AlbumPayload) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AlbumPayload) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AlbumPayload) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *AlbumPayload) HasName() bool`

HasName returns a boolean if a field has been set.

### GetCover

`func (o *AlbumPayload) GetCover() AlbumPayloadCover`

GetCover returns the Cover field if non-nil, zero value otherwise.

### GetCoverOk

`func (o *AlbumPayload) GetCoverOk() (*AlbumPayloadCover, bool)`

GetCoverOk returns a tuple with the Cover field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCover

`func (o *AlbumPayload) SetCover(v AlbumPayloadCover)`

SetCover sets Cover field to given value.

### HasCover

`func (o *AlbumPayload) HasCover() bool`

HasCover returns a boolean if a field has been set.

### GetParent

`func (o *AlbumPayload) GetParent() AlbumPayloadCover`

GetParent returns the Parent field if non-nil, zero value otherwise.

### GetParentOk

`func (o *AlbumPayload) GetParentOk() (*AlbumPayloadCover, bool)`

GetParentOk returns a tuple with the Parent field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetParent

`func (o *AlbumPayload) SetParent(v AlbumPayloadCover)`

SetParent sets Parent field to given value.

### HasParent

`func (o *AlbumPayload) HasParent() bool`

HasParent returns a boolean if a field has been set.

### GetPublishInfo

`func (o *AlbumPayload) GetPublishInfo() AlbumPayloadPublishInfo`

GetPublishInfo returns the PublishInfo field if non-nil, zero value otherwise.

### GetPublishInfoOk

`func (o *AlbumPayload) GetPublishInfoOk() (*AlbumPayloadPublishInfo, bool)`

GetPublishInfoOk returns a tuple with the PublishInfo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublishInfo

`func (o *AlbumPayload) SetPublishInfo(v AlbumPayloadPublishInfo)`

SetPublishInfo sets PublishInfo field to given value.

### HasPublishInfo

`func (o *AlbumPayload) HasPublishInfo() bool`

HasPublishInfo returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


