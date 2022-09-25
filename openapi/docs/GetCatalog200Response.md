# GetCatalog200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Id** | Pointer to **string** |  | [optional] 
**Created** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Updated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Type** | Pointer to **string** |  | [optional] 
**Subtype** | Pointer to **string** |  | [optional] 
**Payload** | Pointer to [**CatalogPayloadSchema**](CatalogPayloadSchema.md) |  | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewGetCatalog200Response

`func NewGetCatalog200Response() *GetCatalog200Response`

NewGetCatalog200Response instantiates a new GetCatalog200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetCatalog200ResponseWithDefaults

`func NewGetCatalog200ResponseWithDefaults() *GetCatalog200Response`

NewGetCatalog200ResponseWithDefaults instantiates a new GetCatalog200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *GetCatalog200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *GetCatalog200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *GetCatalog200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *GetCatalog200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetId

`func (o *GetCatalog200Response) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *GetCatalog200Response) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *GetCatalog200Response) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *GetCatalog200Response) HasId() bool`

HasId returns a boolean if a field has been set.

### GetCreated

`func (o *GetCatalog200Response) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *GetCatalog200Response) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *GetCatalog200Response) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *GetCatalog200Response) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *GetCatalog200Response) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *GetCatalog200Response) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *GetCatalog200Response) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *GetCatalog200Response) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetType

`func (o *GetCatalog200Response) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *GetCatalog200Response) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *GetCatalog200Response) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *GetCatalog200Response) HasType() bool`

HasType returns a boolean if a field has been set.

### GetSubtype

`func (o *GetCatalog200Response) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *GetCatalog200Response) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *GetCatalog200Response) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *GetCatalog200Response) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetPayload

`func (o *GetCatalog200Response) GetPayload() CatalogPayloadSchema`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *GetCatalog200Response) GetPayloadOk() (*CatalogPayloadSchema, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *GetCatalog200Response) SetPayload(v CatalogPayloadSchema)`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *GetCatalog200Response) HasPayload() bool`

HasPayload returns a boolean if a field has been set.

### GetLinks

`func (o *GetCatalog200Response) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *GetCatalog200Response) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *GetCatalog200Response) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *GetCatalog200Response) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


