/*
Lightroom API Documentation

Lightroom API Documentation, made available through [adobe.io](https://developer.adobe.com). API Change Logs are available [here](https://developer.adobe.com/lightroom/lightroom-api-docs/release-notes/).

API version: 1.0.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package openapi

import (
	"encoding/json"
	"fmt"
)

// GetAssetRendition400Response - struct for GetAssetRendition400Response
type GetAssetRendition400Response struct {
	InvaildRequestGUID *InvaildRequestGUID
	InvaildRequestRenditionType *InvaildRequestRenditionType
}

// InvaildRequestGUIDAsGetAssetRendition400Response is a convenience function that returns InvaildRequestGUID wrapped in GetAssetRendition400Response
func InvaildRequestGUIDAsGetAssetRendition400Response(v *InvaildRequestGUID) GetAssetRendition400Response {
	return GetAssetRendition400Response{
		InvaildRequestGUID: v,
	}
}

// InvaildRequestRenditionTypeAsGetAssetRendition400Response is a convenience function that returns InvaildRequestRenditionType wrapped in GetAssetRendition400Response
func InvaildRequestRenditionTypeAsGetAssetRendition400Response(v *InvaildRequestRenditionType) GetAssetRendition400Response {
	return GetAssetRendition400Response{
		InvaildRequestRenditionType: v,
	}
}


// Unmarshal JSON data into one of the pointers in the struct
func (dst *GetAssetRendition400Response) UnmarshalJSON(data []byte) error {
	var err error
	match := 0
	// try to unmarshal data into InvaildRequestGUID
	err = newStrictDecoder(data).Decode(&dst.InvaildRequestGUID)
	if err == nil {
		jsonInvaildRequestGUID, _ := json.Marshal(dst.InvaildRequestGUID)
		if string(jsonInvaildRequestGUID) == "{}" { // empty struct
			dst.InvaildRequestGUID = nil
		} else {
			match++
		}
	} else {
		dst.InvaildRequestGUID = nil
	}

	// try to unmarshal data into InvaildRequestRenditionType
	err = newStrictDecoder(data).Decode(&dst.InvaildRequestRenditionType)
	if err == nil {
		jsonInvaildRequestRenditionType, _ := json.Marshal(dst.InvaildRequestRenditionType)
		if string(jsonInvaildRequestRenditionType) == "{}" { // empty struct
			dst.InvaildRequestRenditionType = nil
		} else {
			match++
		}
	} else {
		dst.InvaildRequestRenditionType = nil
	}

	if match > 1 { // more than 1 match
		// reset to nil
		dst.InvaildRequestGUID = nil
		dst.InvaildRequestRenditionType = nil

		return fmt.Errorf("Data matches more than one schema in oneOf(GetAssetRendition400Response)")
	} else if match == 1 {
		return nil // exactly one match
	} else { // no match
		return fmt.Errorf("Data failed to match schemas in oneOf(GetAssetRendition400Response)")
	}
}

// Marshal data from the first non-nil pointers in the struct to JSON
func (src GetAssetRendition400Response) MarshalJSON() ([]byte, error) {
	if src.InvaildRequestGUID != nil {
		return json.Marshal(&src.InvaildRequestGUID)
	}

	if src.InvaildRequestRenditionType != nil {
		return json.Marshal(&src.InvaildRequestRenditionType)
	}

	return nil, nil // no data in oneOf schemas
}

// Get the actual instance
func (obj *GetAssetRendition400Response) GetActualInstance() (interface{}) {
	if obj == nil {
		return nil
	}
	if obj.InvaildRequestGUID != nil {
		return obj.InvaildRequestGUID
	}

	if obj.InvaildRequestRenditionType != nil {
		return obj.InvaildRequestRenditionType
	}

	// all schemas are nil
	return nil
}

type NullableGetAssetRendition400Response struct {
	value *GetAssetRendition400Response
	isSet bool
}

func (v NullableGetAssetRendition400Response) Get() *GetAssetRendition400Response {
	return v.value
}

func (v *NullableGetAssetRendition400Response) Set(val *GetAssetRendition400Response) {
	v.value = val
	v.isSet = true
}

func (v NullableGetAssetRendition400Response) IsSet() bool {
	return v.isSet
}

func (v *NullableGetAssetRendition400Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableGetAssetRendition400Response(val *GetAssetRendition400Response) *NullableGetAssetRendition400Response {
	return &NullableGetAssetRendition400Response{value: val, isSet: true}
}

func (v NullableGetAssetRendition400Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableGetAssetRendition400Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

