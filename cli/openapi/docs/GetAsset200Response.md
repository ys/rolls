# GetAsset200Response

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
**Favorites** | Pointer to [**SuccessVideoAssetFavorites**](SuccessVideoAssetFavorites.md) |  | [optional] 
**Fingerprint** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewGetAsset200Response

`func NewGetAsset200Response() *GetAsset200Response`

NewGetAsset200Response instantiates a new GetAsset200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAsset200ResponseWithDefaults

`func NewGetAsset200ResponseWithDefaults() *GetAsset200Response`

NewGetAsset200ResponseWithDefaults instantiates a new GetAsset200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *GetAsset200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *GetAsset200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *GetAsset200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *GetAsset200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetId

`func (o *GetAsset200Response) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *GetAsset200Response) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *GetAsset200Response) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *GetAsset200Response) HasId() bool`

HasId returns a boolean if a field has been set.

### GetType

`func (o *GetAsset200Response) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *GetAsset200Response) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *GetAsset200Response) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *GetAsset200Response) HasType() bool`

HasType returns a boolean if a field has been set.

### GetSubtype

`func (o *GetAsset200Response) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *GetAsset200Response) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *GetAsset200Response) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *GetAsset200Response) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetCreated

`func (o *GetAsset200Response) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *GetAsset200Response) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *GetAsset200Response) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *GetAsset200Response) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *GetAsset200Response) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *GetAsset200Response) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *GetAsset200Response) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *GetAsset200Response) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetLinks

`func (o *GetAsset200Response) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *GetAsset200Response) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *GetAsset200Response) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *GetAsset200Response) HasLinks() bool`

HasLinks returns a boolean if a field has been set.

### GetPayload

`func (o *GetAsset200Response) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *GetAsset200Response) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *GetAsset200Response) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *GetAsset200Response) HasPayload() bool`

HasPayload returns a boolean if a field has been set.

### GetFavorites

`func (o *GetAsset200Response) GetFavorites() SuccessVideoAssetFavorites`

GetFavorites returns the Favorites field if non-nil, zero value otherwise.

### GetFavoritesOk

`func (o *GetAsset200Response) GetFavoritesOk() (*SuccessVideoAssetFavorites, bool)`

GetFavoritesOk returns a tuple with the Favorites field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFavorites

`func (o *GetAsset200Response) SetFavorites(v SuccessVideoAssetFavorites)`

SetFavorites sets Favorites field to given value.

### HasFavorites

`func (o *GetAsset200Response) HasFavorites() bool`

HasFavorites returns a boolean if a field has been set.

### GetFingerprint

`func (o *GetAsset200Response) GetFingerprint() map[string]interface{}`

GetFingerprint returns the Fingerprint field if non-nil, zero value otherwise.

### GetFingerprintOk

`func (o *GetAsset200Response) GetFingerprintOk() (*map[string]interface{}, bool)`

GetFingerprintOk returns a tuple with the Fingerprint field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFingerprint

`func (o *GetAsset200Response) SetFingerprint(v map[string]interface{})`

SetFingerprint sets Fingerprint field to given value.

### HasFingerprint

`func (o *GetAsset200Response) HasFingerprint() bool`

HasFingerprint returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


