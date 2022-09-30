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

// CatalogPayloadSchemaSettingsUniversal struct for CatalogPayloadSchemaSettingsUniversal
type CatalogPayloadSchemaSettingsUniversal struct {
	Connections map[string]interface{} `json:"connections,omitempty"`
}

// NewCatalogPayloadSchemaSettingsUniversal instantiates a new CatalogPayloadSchemaSettingsUniversal object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCatalogPayloadSchemaSettingsUniversal() *CatalogPayloadSchemaSettingsUniversal {
	this := CatalogPayloadSchemaSettingsUniversal{}
	return &this
}

// NewCatalogPayloadSchemaSettingsUniversalWithDefaults instantiates a new CatalogPayloadSchemaSettingsUniversal object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCatalogPayloadSchemaSettingsUniversalWithDefaults() *CatalogPayloadSchemaSettingsUniversal {
	this := CatalogPayloadSchemaSettingsUniversal{}
	return &this
}

// GetConnections returns the Connections field value if set, zero value otherwise.
func (o *CatalogPayloadSchemaSettingsUniversal) GetConnections() map[string]interface{} {
	if o == nil || o.Connections == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Connections
}

// GetConnectionsOk returns a tuple with the Connections field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CatalogPayloadSchemaSettingsUniversal) GetConnectionsOk() (map[string]interface{}, bool) {
	if o == nil || o.Connections == nil {
		return nil, false
	}
	return o.Connections, true
}

// HasConnections returns a boolean if a field has been set.
func (o *CatalogPayloadSchemaSettingsUniversal) HasConnections() bool {
	if o != nil && o.Connections != nil {
		return true
	}

	return false
}

// SetConnections gets a reference to the given map[string]interface{} and assigns it to the Connections field.
func (o *CatalogPayloadSchemaSettingsUniversal) SetConnections(v map[string]interface{}) {
	o.Connections = v
}

func (o CatalogPayloadSchemaSettingsUniversal) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Connections != nil {
		toSerialize["connections"] = o.Connections
	}
	return json.Marshal(toSerialize)
}

type NullableCatalogPayloadSchemaSettingsUniversal struct {
	value *CatalogPayloadSchemaSettingsUniversal
	isSet bool
}

func (v NullableCatalogPayloadSchemaSettingsUniversal) Get() *CatalogPayloadSchemaSettingsUniversal {
	return v.value
}

func (v *NullableCatalogPayloadSchemaSettingsUniversal) Set(val *CatalogPayloadSchemaSettingsUniversal) {
	v.value = val
	v.isSet = true
}

func (v NullableCatalogPayloadSchemaSettingsUniversal) IsSet() bool {
	return v.isSet
}

func (v *NullableCatalogPayloadSchemaSettingsUniversal) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCatalogPayloadSchemaSettingsUniversal(val *CatalogPayloadSchemaSettingsUniversal) *NullableCatalogPayloadSchemaSettingsUniversal {
	return &NullableCatalogPayloadSchemaSettingsUniversal{value: val, isSet: true}
}

func (v NullableCatalogPayloadSchemaSettingsUniversal) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCatalogPayloadSchemaSettingsUniversal) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

