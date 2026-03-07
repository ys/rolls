# CatalogPayloadSchema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**UserCreated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**UserUpdated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Name** | **string** |  | 
**AssetSortOrder** | Pointer to **string** |  | [optional] 
**Presets** | Pointer to [**CatalogPayloadSchemaPresets**](CatalogPayloadSchemaPresets.md) |  | [optional] 
**Profiles** | Pointer to [**CatalogPayloadSchemaPresets**](CatalogPayloadSchemaPresets.md) |  | [optional] 
**Settings** | Pointer to [**CatalogPayloadSchemaSettings**](CatalogPayloadSchemaSettings.md) |  | [optional] 

## Methods

### NewCatalogPayloadSchema

`func NewCatalogPayloadSchema(name string, ) *CatalogPayloadSchema`

NewCatalogPayloadSchema instantiates a new CatalogPayloadSchema object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCatalogPayloadSchemaWithDefaults

`func NewCatalogPayloadSchemaWithDefaults() *CatalogPayloadSchema`

NewCatalogPayloadSchemaWithDefaults instantiates a new CatalogPayloadSchema object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUserCreated

`func (o *CatalogPayloadSchema) GetUserCreated() string`

GetUserCreated returns the UserCreated field if non-nil, zero value otherwise.

### GetUserCreatedOk

`func (o *CatalogPayloadSchema) GetUserCreatedOk() (*string, bool)`

GetUserCreatedOk returns a tuple with the UserCreated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserCreated

`func (o *CatalogPayloadSchema) SetUserCreated(v string)`

SetUserCreated sets UserCreated field to given value.

### HasUserCreated

`func (o *CatalogPayloadSchema) HasUserCreated() bool`

HasUserCreated returns a boolean if a field has been set.

### GetUserUpdated

`func (o *CatalogPayloadSchema) GetUserUpdated() string`

GetUserUpdated returns the UserUpdated field if non-nil, zero value otherwise.

### GetUserUpdatedOk

`func (o *CatalogPayloadSchema) GetUserUpdatedOk() (*string, bool)`

GetUserUpdatedOk returns a tuple with the UserUpdated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserUpdated

`func (o *CatalogPayloadSchema) SetUserUpdated(v string)`

SetUserUpdated sets UserUpdated field to given value.

### HasUserUpdated

`func (o *CatalogPayloadSchema) HasUserUpdated() bool`

HasUserUpdated returns a boolean if a field has been set.

### GetName

`func (o *CatalogPayloadSchema) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CatalogPayloadSchema) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CatalogPayloadSchema) SetName(v string)`

SetName sets Name field to given value.


### GetAssetSortOrder

`func (o *CatalogPayloadSchema) GetAssetSortOrder() string`

GetAssetSortOrder returns the AssetSortOrder field if non-nil, zero value otherwise.

### GetAssetSortOrderOk

`func (o *CatalogPayloadSchema) GetAssetSortOrderOk() (*string, bool)`

GetAssetSortOrderOk returns a tuple with the AssetSortOrder field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAssetSortOrder

`func (o *CatalogPayloadSchema) SetAssetSortOrder(v string)`

SetAssetSortOrder sets AssetSortOrder field to given value.

### HasAssetSortOrder

`func (o *CatalogPayloadSchema) HasAssetSortOrder() bool`

HasAssetSortOrder returns a boolean if a field has been set.

### GetPresets

`func (o *CatalogPayloadSchema) GetPresets() CatalogPayloadSchemaPresets`

GetPresets returns the Presets field if non-nil, zero value otherwise.

### GetPresetsOk

`func (o *CatalogPayloadSchema) GetPresetsOk() (*CatalogPayloadSchemaPresets, bool)`

GetPresetsOk returns a tuple with the Presets field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPresets

`func (o *CatalogPayloadSchema) SetPresets(v CatalogPayloadSchemaPresets)`

SetPresets sets Presets field to given value.

### HasPresets

`func (o *CatalogPayloadSchema) HasPresets() bool`

HasPresets returns a boolean if a field has been set.

### GetProfiles

`func (o *CatalogPayloadSchema) GetProfiles() CatalogPayloadSchemaPresets`

GetProfiles returns the Profiles field if non-nil, zero value otherwise.

### GetProfilesOk

`func (o *CatalogPayloadSchema) GetProfilesOk() (*CatalogPayloadSchemaPresets, bool)`

GetProfilesOk returns a tuple with the Profiles field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProfiles

`func (o *CatalogPayloadSchema) SetProfiles(v CatalogPayloadSchemaPresets)`

SetProfiles sets Profiles field to given value.

### HasProfiles

`func (o *CatalogPayloadSchema) HasProfiles() bool`

HasProfiles returns a boolean if a field has been set.

### GetSettings

`func (o *CatalogPayloadSchema) GetSettings() CatalogPayloadSchemaSettings`

GetSettings returns the Settings field if non-nil, zero value otherwise.

### GetSettingsOk

`func (o *CatalogPayloadSchema) GetSettingsOk() (*CatalogPayloadSchemaSettings, bool)`

GetSettingsOk returns a tuple with the Settings field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSettings

`func (o *CatalogPayloadSchema) SetSettings(v CatalogPayloadSchemaSettings)`

SetSettings sets Settings field to given value.

### HasSettings

`func (o *CatalogPayloadSchema) HasSettings() bool`

HasSettings returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


