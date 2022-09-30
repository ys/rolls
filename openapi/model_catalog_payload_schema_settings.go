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

// CatalogPayloadSchemaSettings struct for CatalogPayloadSchemaSettings
type CatalogPayloadSchemaSettings struct {
	Universal *CatalogPayloadSchemaSettingsUniversal `json:"universal,omitempty"`
	Desktop map[string]interface{} `json:"desktop,omitempty"`
	Web map[string]interface{} `json:"web,omitempty"`
	Mobile map[string]interface{} `json:"mobile,omitempty"`
	Photosdk map[string]interface{} `json:"photosdk,omitempty"`
}

// NewCatalogPayloadSchemaSettings instantiates a new CatalogPayloadSchemaSettings object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCatalogPayloadSchemaSettings() *CatalogPayloadSchemaSettings {
	this := CatalogPayloadSchemaSettings{}
	return &this
}

// NewCatalogPayloadSchemaSettingsWithDefaults instantiates a new CatalogPayloadSchemaSettings object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCatalogPayloadSchemaSettingsWithDefaults() *CatalogPayloadSchemaSettings {
	this := CatalogPayloadSchemaSettings{}
	return &this
}

// GetUniversal returns the Universal field value if set, zero value otherwise.
func (o *CatalogPayloadSchemaSettings) GetUniversal() CatalogPayloadSchemaSettingsUniversal {
	if o == nil || o.Universal == nil {
		var ret CatalogPayloadSchemaSettingsUniversal
		return ret
	}
	return *o.Universal
}

// GetUniversalOk returns a tuple with the Universal field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchemaSettings) GetUniversalOk() (*CatalogPayloadSchemaSettingsUniversal, bool) {
	if o == nil || o.Universal == nil {
		return nil, false
	}
	return o.Universal, true
}

// HasUniversal returns a boolean if a field has been set.
func (o *CatalogPayloadSchemaSettings) HasUniversal() bool {
	if o != nil && o.Universal != nil {
		return true
	}

	return false
}

// SetUniversal gets a reference to the given CatalogPayloadSchemaSettingsUniversal and assigns it to the Universal field.
func (o *CatalogPayloadSchemaSettings) SetUniversal(v CatalogPayloadSchemaSettingsUniversal) {
	o.Universal = &v
}

// GetDesktop returns the Desktop field value if set, zero value otherwise.
func (o *CatalogPayloadSchemaSettings) GetDesktop() map[string]interface{} {
	if o == nil || o.Desktop == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Desktop
}

// GetDesktopOk returns a tuple with the Desktop field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchemaSettings) GetDesktopOk() (map[string]interface{}, bool) {
	if o == nil || o.Desktop == nil {
		return nil, false
	}
	return o.Desktop, true
}

// HasDesktop returns a boolean if a field has been set.
func (o *CatalogPayloadSchemaSettings) HasDesktop() bool {
	if o != nil && o.Desktop != nil {
		return true
	}

	return false
}

// SetDesktop gets a reference to the given map[string]interface{} and assigns it to the Desktop field.
func (o *CatalogPayloadSchemaSettings) SetDesktop(v map[string]interface{}) {
	o.Desktop = v
}

// GetWeb returns the Web field value if set, zero value otherwise.
func (o *CatalogPayloadSchemaSettings) GetWeb() map[string]interface{} {
	if o == nil || o.Web == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Web
}

// GetWebOk returns a tuple with the Web field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchemaSettings) GetWebOk() (map[string]interface{}, bool) {
	if o == nil || o.Web == nil {
		return nil, false
	}
	return o.Web, true
}

// HasWeb returns a boolean if a field has been set.
func (o *CatalogPayloadSchemaSettings) HasWeb() bool {
	if o != nil && o.Web != nil {
		return true
	}

	return false
}

// SetWeb gets a reference to the given map[string]interface{} and assigns it to the Web field.
func (o *CatalogPayloadSchemaSettings) SetWeb(v map[string]interface{}) {
	o.Web = v
}

// GetMobile returns the Mobile field value if set, zero value otherwise.
func (o *CatalogPayloadSchemaSettings) GetMobile() map[string]interface{} {
	if o == nil || o.Mobile == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Mobile
}

// GetMobileOk returns a tuple with the Mobile field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchemaSettings) GetMobileOk() (map[string]interface{}, bool) {
	if o == nil || o.Mobile == nil {
		return nil, false
	}
	return o.Mobile, true
}

// HasMobile returns a boolean if a field has been set.
func (o *CatalogPayloadSchemaSettings) HasMobile() bool {
	if o != nil && o.Mobile != nil {
		return true
	}

	return false
}

// SetMobile gets a reference to the given map[string]interface{} and assigns it to the Mobile field.
func (o *CatalogPayloadSchemaSettings) SetMobile(v map[string]interface{}) {
	o.Mobile = v
}

// GetPhotosdk returns the Photosdk field value if set, zero value otherwise.
func (o *CatalogPayloadSchemaSettings) GetPhotosdk() map[string]interface{} {
	if o == nil || o.Photosdk == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Photosdk
}

// GetPhotosdkOk returns a tuple with the Photosdk field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchemaSettings) GetPhotosdkOk() (map[string]interface{}, bool) {
	if o == nil || o.Photosdk == nil {
		return nil, false
	}
	return o.Photosdk, true
}

// HasPhotosdk returns a boolean if a field has been set.
func (o *CatalogPayloadSchemaSettings) HasPhotosdk() bool {
	if o != nil && o.Photosdk != nil {
		return true
	}

	return false
}

// SetPhotosdk gets a reference to the given map[string]interface{} and assigns it to the Photosdk field.
func (o *CatalogPayloadSchemaSettings) SetPhotosdk(v map[string]interface{}) {
	o.Photosdk = v
}

func (o CatalogPayloadSchemaSettings) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Universal != nil {
		toSerialize["universal"] = o.Universal
	}
	if o.Desktop != nil {
		toSerialize["desktop"] = o.Desktop
	}
	if o.Web != nil {
		toSerialize["web"] = o.Web
	}
	if o.Mobile != nil {
		toSerialize["mobile"] = o.Mobile
	}
	if o.Photosdk != nil {
		toSerialize["photosdk"] = o.Photosdk
	}
	return json.Marshal(toSerialize)
}

type NullableCatalogPayloadSchemaSettings struct {
	value *CatalogPayloadSchemaSettings
	isSet bool
}

func (v NullableCatalogPayloadSchemaSettings) Get() *CatalogPayloadSchemaSettings {
	return v.value
}

func (v *NullableCatalogPayloadSchemaSettings) Set(val *CatalogPayloadSchemaSettings) {
	v.value = val
	v.isSet = true
}

func (v NullableCatalogPayloadSchemaSettings) IsSet() bool {
	return v.isSet
}

func (v *NullableCatalogPayloadSchemaSettings) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCatalogPayloadSchemaSettings(val *CatalogPayloadSchemaSettings) *NullableCatalogPayloadSchemaSettings {
	return &NullableCatalogPayloadSchemaSettings{value: val, isSet: true}
}

func (v NullableCatalogPayloadSchemaSettings) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCatalogPayloadSchemaSettings) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

