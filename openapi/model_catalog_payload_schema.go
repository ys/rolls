/*
Lightroom API Documentation

Lightroom API Documentation, made available through [adobe.io](https://developer.adobe.com). API Change Logs are available [here](https://developer.adobe.com/lightroom/lightroom-api-docs/release-notes/).

API version: 1.0.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package openapi

import (
	"encoding/json"
)

// CatalogPayloadSchema struct for CatalogPayloadSchema
type CatalogPayloadSchema struct {
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	UserCreated *string `json:"userCreated,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	UserUpdated *string `json:"userUpdated,omitempty"`
	Name string `json:"name"`
	AssetSortOrder *string `json:"assetSortOrder,omitempty"`
	Presets *CatalogPayloadSchemaPresets `json:"presets,omitempty"`
	Profiles *CatalogPayloadSchemaPresets `json:"profiles,omitempty"`
	Settings *CatalogPayloadSchemaSettings `json:"settings,omitempty"`
}

// NewCatalogPayloadSchema instantiates a new CatalogPayloadSchema object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCatalogPayloadSchema(name string) *CatalogPayloadSchema {
	this := CatalogPayloadSchema{}
	this.Name = name
	return &this
}

// NewCatalogPayloadSchemaWithDefaults instantiates a new CatalogPayloadSchema object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCatalogPayloadSchemaWithDefaults() *CatalogPayloadSchema {
	this := CatalogPayloadSchema{}
	return &this
}

// GetUserCreated returns the UserCreated field value if set, zero value otherwise.
func (o *CatalogPayloadSchema) GetUserCreated() string {
	if o == nil || o.UserCreated == nil {
		var ret string
		return ret
	}
	return *o.UserCreated
}

// GetUserCreatedOk returns a tuple with the UserCreated field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetUserCreatedOk() (*string, bool) {
	if o == nil || o.UserCreated == nil {
		return nil, false
	}
	return o.UserCreated, true
}

// HasUserCreated returns a boolean if a field has been set.
func (o *CatalogPayloadSchema) HasUserCreated() bool {
	if o != nil && o.UserCreated != nil {
		return true
	}

	return false
}

// SetUserCreated gets a reference to the given string and assigns it to the UserCreated field.
func (o *CatalogPayloadSchema) SetUserCreated(v string) {
	o.UserCreated = &v
}

// GetUserUpdated returns the UserUpdated field value if set, zero value otherwise.
func (o *CatalogPayloadSchema) GetUserUpdated() string {
	if o == nil || o.UserUpdated == nil {
		var ret string
		return ret
	}
	return *o.UserUpdated
}

// GetUserUpdatedOk returns a tuple with the UserUpdated field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetUserUpdatedOk() (*string, bool) {
	if o == nil || o.UserUpdated == nil {
		return nil, false
	}
	return o.UserUpdated, true
}

// HasUserUpdated returns a boolean if a field has been set.
func (o *CatalogPayloadSchema) HasUserUpdated() bool {
	if o != nil && o.UserUpdated != nil {
		return true
	}

	return false
}

// SetUserUpdated gets a reference to the given string and assigns it to the UserUpdated field.
func (o *CatalogPayloadSchema) SetUserUpdated(v string) {
	o.UserUpdated = &v
}

// GetName returns the Name field value
func (o *CatalogPayloadSchema) GetName() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Name
}

// GetNameOk returns a tuple with the Name field value
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetNameOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Name, true
}

// SetName sets field value
func (o *CatalogPayloadSchema) SetName(v string) {
	o.Name = v
}

// GetAssetSortOrder returns the AssetSortOrder field value if set, zero value otherwise.
func (o *CatalogPayloadSchema) GetAssetSortOrder() string {
	if o == nil || o.AssetSortOrder == nil {
		var ret string
		return ret
	}
	return *o.AssetSortOrder
}

// GetAssetSortOrderOk returns a tuple with the AssetSortOrder field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetAssetSortOrderOk() (*string, bool) {
	if o == nil || o.AssetSortOrder == nil {
		return nil, false
	}
	return o.AssetSortOrder, true
}

// HasAssetSortOrder returns a boolean if a field has been set.
func (o *CatalogPayloadSchema) HasAssetSortOrder() bool {
	if o != nil && o.AssetSortOrder != nil {
		return true
	}

	return false
}

// SetAssetSortOrder gets a reference to the given string and assigns it to the AssetSortOrder field.
func (o *CatalogPayloadSchema) SetAssetSortOrder(v string) {
	o.AssetSortOrder = &v
}

// GetPresets returns the Presets field value if set, zero value otherwise.
func (o *CatalogPayloadSchema) GetPresets() CatalogPayloadSchemaPresets {
	if o == nil || o.Presets == nil {
		var ret CatalogPayloadSchemaPresets
		return ret
	}
	return *o.Presets
}

// GetPresetsOk returns a tuple with the Presets field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetPresetsOk() (*CatalogPayloadSchemaPresets, bool) {
	if o == nil || o.Presets == nil {
		return nil, false
	}
	return o.Presets, true
}

// HasPresets returns a boolean if a field has been set.
func (o *CatalogPayloadSchema) HasPresets() bool {
	if o != nil && o.Presets != nil {
		return true
	}

	return false
}

// SetPresets gets a reference to the given CatalogPayloadSchemaPresets and assigns it to the Presets field.
func (o *CatalogPayloadSchema) SetPresets(v CatalogPayloadSchemaPresets) {
	o.Presets = &v
}

// GetProfiles returns the Profiles field value if set, zero value otherwise.
func (o *CatalogPayloadSchema) GetProfiles() CatalogPayloadSchemaPresets {
	if o == nil || o.Profiles == nil {
		var ret CatalogPayloadSchemaPresets
		return ret
	}
	return *o.Profiles
}

// GetProfilesOk returns a tuple with the Profiles field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetProfilesOk() (*CatalogPayloadSchemaPresets, bool) {
	if o == nil || o.Profiles == nil {
		return nil, false
	}
	return o.Profiles, true
}

// HasProfiles returns a boolean if a field has been set.
func (o *CatalogPayloadSchema) HasProfiles() bool {
	if o != nil && o.Profiles != nil {
		return true
	}

	return false
}

// SetProfiles gets a reference to the given CatalogPayloadSchemaPresets and assigns it to the Profiles field.
func (o *CatalogPayloadSchema) SetProfiles(v CatalogPayloadSchemaPresets) {
	o.Profiles = &v
}

// GetSettings returns the Settings field value if set, zero value otherwise.
func (o *CatalogPayloadSchema) GetSettings() CatalogPayloadSchemaSettings {
	if o == nil || o.Settings == nil {
		var ret CatalogPayloadSchemaSettings
		return ret
	}
	return *o.Settings
}

// GetSettingsOk returns a tuple with the Settings field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchema) GetSettingsOk() (*CatalogPayloadSchemaSettings, bool) {
	if o == nil || o.Settings == nil {
		return nil, false
	}
	return o.Settings, true
}

// HasSettings returns a boolean if a field has been set.
func (o *CatalogPayloadSchema) HasSettings() bool {
	if o != nil && o.Settings != nil {
		return true
	}

	return false
}

// SetSettings gets a reference to the given CatalogPayloadSchemaSettings and assigns it to the Settings field.
func (o *CatalogPayloadSchema) SetSettings(v CatalogPayloadSchemaSettings) {
	o.Settings = &v
}

func (o CatalogPayloadSchema) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.UserCreated != nil {
		toSerialize["userCreated"] = o.UserCreated
	}
	if o.UserUpdated != nil {
		toSerialize["userUpdated"] = o.UserUpdated
	}
	if true {
		toSerialize["name"] = o.Name
	}
	if o.AssetSortOrder != nil {
		toSerialize["assetSortOrder"] = o.AssetSortOrder
	}
	if o.Presets != nil {
		toSerialize["presets"] = o.Presets
	}
	if o.Profiles != nil {
		toSerialize["profiles"] = o.Profiles
	}
	if o.Settings != nil {
		toSerialize["settings"] = o.Settings
	}
	return json.Marshal(toSerialize)
}

type NullableCatalogPayloadSchema struct {
	value *CatalogPayloadSchema
	isSet bool
}

func (v NullableCatalogPayloadSchema) Get() *CatalogPayloadSchema {
	return v.value
}

func (v *NullableCatalogPayloadSchema) Set(val *CatalogPayloadSchema) {
	v.value = val
	v.isSet = true
}

func (v NullableCatalogPayloadSchema) IsSet() bool {
	return v.isSet
}

func (v *NullableCatalogPayloadSchema) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCatalogPayloadSchema(val *CatalogPayloadSchema) *NullableCatalogPayloadSchema {
	return &NullableCatalogPayloadSchema{value: val, isSet: true}
}

func (v NullableCatalogPayloadSchema) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCatalogPayloadSchema) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

