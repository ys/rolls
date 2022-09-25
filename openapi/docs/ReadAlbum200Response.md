# ReadAlbum200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Id** | Pointer to **string** |  | [optional] 
**Type** | Pointer to **string** |  | [optional] 
**Subtype** | Pointer to **string** |  | [optional] 
**Created** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Updated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 
**Payload** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewReadAlbum200Response

`func NewReadAlbum200Response() *ReadAlbum200Response`

NewReadAlbum200Response instantiates a new ReadAlbum200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewReadAlbum200ResponseWithDefaults

`func NewReadAlbum200ResponseWithDefaults() *ReadAlbum200Response`

NewReadAlbum200ResponseWithDefaults instantiates a new ReadAlbum200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *ReadAlbum200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *ReadAlbum200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *ReadAlbum200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *ReadAlbum200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetId

`func (o *ReadAlbum200Response) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ReadAlbum200Response) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ReadAlbum200Response) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ReadAlbum200Response) HasId() bool`

HasId returns a boolean if a field has been set.

### GetType

`func (o *ReadAlbum200Response) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ReadAlbum200Response) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ReadAlbum200Response) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *ReadAlbum200Response) HasType() bool`

HasType returns a boolean if a field has been set.

### GetSubtype

`func (o *ReadAlbum200Response) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *ReadAlbum200Response) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *ReadAlbum200Response) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *ReadAlbum200Response) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetCreated

`func (o *ReadAlbum200Response) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *ReadAlbum200Response) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *ReadAlbum200Response) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *ReadAlbum200Response) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *ReadAlbum200Response) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *ReadAlbum200Response) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *ReadAlbum200Response) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *ReadAlbum200Response) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetLinks

`func (o *ReadAlbum200Response) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *ReadAlbum200Response) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *ReadAlbum200Response) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *ReadAlbum200Response) HasLinks() bool`

HasLinks returns a boolean if a field has been set.

### GetPayload

`func (o *ReadAlbum200Response) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *ReadAlbum200Response) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *ReadAlbum200Response) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *ReadAlbum200Response) HasPayload() bool`

HasPayload returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


