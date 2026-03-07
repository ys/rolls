# SuccessVideoAsset

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

### NewSuccessVideoAsset

`func NewSuccessVideoAsset() *SuccessVideoAsset`

NewSuccessVideoAsset instantiates a new SuccessVideoAsset object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSuccessVideoAssetWithDefaults

`func NewSuccessVideoAssetWithDefaults() *SuccessVideoAsset`

NewSuccessVideoAssetWithDefaults instantiates a new SuccessVideoAsset object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *SuccessVideoAsset) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *SuccessVideoAsset) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *SuccessVideoAsset) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *SuccessVideoAsset) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetId

`func (o *SuccessVideoAsset) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *SuccessVideoAsset) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *SuccessVideoAsset) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *SuccessVideoAsset) HasId() bool`

HasId returns a boolean if a field has been set.

### GetType

`func (o *SuccessVideoAsset) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *SuccessVideoAsset) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *SuccessVideoAsset) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *SuccessVideoAsset) HasType() bool`

HasType returns a boolean if a field has been set.

### GetSubtype

`func (o *SuccessVideoAsset) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *SuccessVideoAsset) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *SuccessVideoAsset) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *SuccessVideoAsset) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetCreated

`func (o *SuccessVideoAsset) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *SuccessVideoAsset) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *SuccessVideoAsset) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *SuccessVideoAsset) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *SuccessVideoAsset) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *SuccessVideoAsset) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *SuccessVideoAsset) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *SuccessVideoAsset) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetLinks

`func (o *SuccessVideoAsset) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *SuccessVideoAsset) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *SuccessVideoAsset) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *SuccessVideoAsset) HasLinks() bool`

HasLinks returns a boolean if a field has been set.

### GetPayload

`func (o *SuccessVideoAsset) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *SuccessVideoAsset) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *SuccessVideoAsset) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *SuccessVideoAsset) HasPayload() bool`

HasPayload returns a boolean if a field has been set.

### GetFavorites

`func (o *SuccessVideoAsset) GetFavorites() SuccessVideoAssetFavorites`

GetFavorites returns the Favorites field if non-nil, zero value otherwise.

### GetFavoritesOk

`func (o *SuccessVideoAsset) GetFavoritesOk() (*SuccessVideoAssetFavorites, bool)`

GetFavoritesOk returns a tuple with the Favorites field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFavorites

`func (o *SuccessVideoAsset) SetFavorites(v SuccessVideoAssetFavorites)`

SetFavorites sets Favorites field to given value.

### HasFavorites

`func (o *SuccessVideoAsset) HasFavorites() bool`

HasFavorites returns a boolean if a field has been set.

### GetFingerprint

`func (o *SuccessVideoAsset) GetFingerprint() map[string]interface{}`

GetFingerprint returns the Fingerprint field if non-nil, zero value otherwise.

### GetFingerprintOk

`func (o *SuccessVideoAsset) GetFingerprintOk() (*map[string]interface{}, bool)`

GetFingerprintOk returns a tuple with the Fingerprint field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFingerprint

`func (o *SuccessVideoAsset) SetFingerprint(v map[string]interface{})`

SetFingerprint sets Fingerprint field to given value.

### HasFingerprint

`func (o *SuccessVideoAsset) HasFingerprint() bool`

HasFingerprint returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


