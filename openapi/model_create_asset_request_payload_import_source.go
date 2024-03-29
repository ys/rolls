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

// CreateAssetRequestPayloadImportSource struct for CreateAssetRequestPayloadImportSource
type CreateAssetRequestPayloadImportSource struct {
	FileName string `json:"fileName"`
	// Name of the device that imported the image.
	ImportedOnDevice string `json:"importedOnDevice"`
	// Account ID of the user who imported the asset.
	ImportedBy string `json:"importedBy"`
	// datetime in ISO-8601 format (e.g. 2016-01-15T16:18:00-05:00) with both date and time required, including seconds, but timezone optional. Also flexible on allowing some nonstandard timezone formats like 2016-01-15T12:10:32+0000 or 2016-01-15T12:10:32-05.
	ImportTimestamp string `json:"importTimestamp"`
}

// NewCreateAssetRequestPayloadImportSource instantiates a new CreateAssetRequestPayloadImportSource object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCreateAssetRequestPayloadImportSource(fileName string, importedOnDevice string, importedBy string, importTimestamp string) *CreateAssetRequestPayloadImportSource {
	this := CreateAssetRequestPayloadImportSource{}
	this.FileName = fileName
	this.ImportedOnDevice = importedOnDevice
	this.ImportedBy = importedBy
	this.ImportTimestamp = importTimestamp
	return &this
}

// NewCreateAssetRequestPayloadImportSourceWithDefaults instantiates a new CreateAssetRequestPayloadImportSource object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCreateAssetRequestPayloadImportSourceWithDefaults() *CreateAssetRequestPayloadImportSource {
	this := CreateAssetRequestPayloadImportSource{}
	return &this
}

// GetFileName returns the FileName field value
func (o *CreateAssetRequestPayloadImportSource) GetFileName() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.FileName
}

// GetFileNameOk returns a tuple with the FileName field value
// and a boolean to check if the value has been set.
func (o *CreateAssetRequestPayloadImportSource) GetFileNameOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.FileName, true
}

// SetFileName sets field value
func (o *CreateAssetRequestPayloadImportSource) SetFileName(v string) {
	o.FileName = v
}

// GetImportedOnDevice returns the ImportedOnDevice field value
func (o *CreateAssetRequestPayloadImportSource) GetImportedOnDevice() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.ImportedOnDevice
}

// GetImportedOnDeviceOk returns a tuple with the ImportedOnDevice field value
// and a boolean to check if the value has been set.
func (o *CreateAssetRequestPayloadImportSource) GetImportedOnDeviceOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.ImportedOnDevice, true
}

// SetImportedOnDevice sets field value
func (o *CreateAssetRequestPayloadImportSource) SetImportedOnDevice(v string) {
	o.ImportedOnDevice = v
}

// GetImportedBy returns the ImportedBy field value
func (o *CreateAssetRequestPayloadImportSource) GetImportedBy() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.ImportedBy
}

// GetImportedByOk returns a tuple with the ImportedBy field value
// and a boolean to check if the value has been set.
func (o *CreateAssetRequestPayloadImportSource) GetImportedByOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.ImportedBy, true
}

// SetImportedBy sets field value
func (o *CreateAssetRequestPayloadImportSource) SetImportedBy(v string) {
	o.ImportedBy = v
}

// GetImportTimestamp returns the ImportTimestamp field value
func (o *CreateAssetRequestPayloadImportSource) GetImportTimestamp() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.ImportTimestamp
}

// GetImportTimestampOk returns a tuple with the ImportTimestamp field value
// and a boolean to check if the value has been set.
func (o *CreateAssetRequestPayloadImportSource) GetImportTimestampOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.ImportTimestamp, true
}

// SetImportTimestamp sets field value
func (o *CreateAssetRequestPayloadImportSource) SetImportTimestamp(v string) {
	o.ImportTimestamp = v
}

func (o CreateAssetRequestPayloadImportSource) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if true {
		toSerialize["fileName"] = o.FileName
	}
	if true {
		toSerialize["importedOnDevice"] = o.ImportedOnDevice
	}
	if true {
		toSerialize["importedBy"] = o.ImportedBy
	}
	if true {
		toSerialize["importTimestamp"] = o.ImportTimestamp
	}
	return json.Marshal(toSerialize)
}

type NullableCreateAssetRequestPayloadImportSource struct {
	value *CreateAssetRequestPayloadImportSource
	isSet bool
}

func (v NullableCreateAssetRequestPayloadImportSource) Get() *CreateAssetRequestPayloadImportSource {
	return v.value
}

func (v *NullableCreateAssetRequestPayloadImportSource) Set(val *CreateAssetRequestPayloadImportSource) {
	v.value = val
	v.isSet = true
}

func (v NullableCreateAssetRequestPayloadImportSource) IsSet() bool {
	return v.isSet
}

func (v *NullableCreateAssetRequestPayloadImportSource) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCreateAssetRequestPayloadImportSource(val *CreateAssetRequestPayloadImportSource) *NullableCreateAssetRequestPayloadImportSource {
	return &NullableCreateAssetRequestPayloadImportSource{value: val, isSet: true}
}

func (v NullableCreateAssetRequestPayloadImportSource) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCreateAssetRequestPayloadImportSource) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


