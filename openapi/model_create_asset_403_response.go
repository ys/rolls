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

// CreateAsset403Response - struct for CreateAsset403Response
type CreateAsset403Response struct {
	ForbiddenKeyError *ForbiddenKeyError
	QuotaExceededError *QuotaExceededError
	ResourceExistsError *ResourceExistsError
}

// ForbiddenKeyErrorAsCreateAsset403Response is a convenience function that returns ForbiddenKeyError wrapped in CreateAsset403Response
func ForbiddenKeyErrorAsCreateAsset403Response(v *ForbiddenKeyError) CreateAsset403Response {
	return CreateAsset403Response{
		ForbiddenKeyError: v,
	}
}

// QuotaExceededErrorAsCreateAsset403Response is a convenience function that returns QuotaExceededError wrapped in CreateAsset403Response
func QuotaExceededErrorAsCreateAsset403Response(v *QuotaExceededError) CreateAsset403Response {
	return CreateAsset403Response{
		QuotaExceededError: v,
	}
}

// ResourceExistsErrorAsCreateAsset403Response is a convenience function that returns ResourceExistsError wrapped in CreateAsset403Response
func ResourceExistsErrorAsCreateAsset403Response(v *ResourceExistsError) CreateAsset403Response {
	return CreateAsset403Response{
		ResourceExistsError: v,
	}
}


// Unmarshal JSON data into one of the pointers in the struct
func (dst *CreateAsset403Response) UnmarshalJSON(data []byte) error {
	var err error
	match := 0
	// try to unmarshal data into ForbiddenKeyError
	err = newStrictDecoder(data).Decode(&dst.ForbiddenKeyError)
	if err == nil {
		jsonForbiddenKeyError, _ := json.Marshal(dst.ForbiddenKeyError)
		if string(jsonForbiddenKeyError) == "{}" { // empty struct
			dst.ForbiddenKeyError = nil
		} else {
			match++
		}
	} else {
		dst.ForbiddenKeyError = nil
	}

	// try to unmarshal data into QuotaExceededError
	err = newStrictDecoder(data).Decode(&dst.QuotaExceededError)
	if err == nil {
		jsonQuotaExceededError, _ := json.Marshal(dst.QuotaExceededError)
		if string(jsonQuotaExceededError) == "{}" { // empty struct
			dst.QuotaExceededError = nil
		} else {
			match++
		}
	} else {
		dst.QuotaExceededError = nil
	}

	// try to unmarshal data into ResourceExistsError
	err = newStrictDecoder(data).Decode(&dst.ResourceExistsError)
	if err == nil {
		jsonResourceExistsError, _ := json.Marshal(dst.ResourceExistsError)
		if string(jsonResourceExistsError) == "{}" { // empty struct
			dst.ResourceExistsError = nil
		} else {
			match++
		}
	} else {
		dst.ResourceExistsError = nil
	}

	if match > 1 { // more than 1 match
		// reset to nil
		dst.ForbiddenKeyError = nil
		dst.QuotaExceededError = nil
		dst.ResourceExistsError = nil

		return fmt.Errorf("Data matches more than one schema in oneOf(CreateAsset403Response)")
	} else if match == 1 {
		return nil // exactly one match
	} else { // no match
		return fmt.Errorf("Data failed to match schemas in oneOf(CreateAsset403Response)")
	}
}

// Marshal data from the first non-nil pointers in the struct to JSON
func (src CreateAsset403Response) MarshalJSON() ([]byte, error) {
	if src.ForbiddenKeyError != nil {
		return json.Marshal(&src.ForbiddenKeyError)
	}

	if src.QuotaExceededError != nil {
		return json.Marshal(&src.QuotaExceededError)
	}

	if src.ResourceExistsError != nil {
		return json.Marshal(&src.ResourceExistsError)
	}

	return nil, nil // no data in oneOf schemas
}

// Get the actual instance
func (obj *CreateAsset403Response) GetActualInstance() (interface{}) {
	if obj == nil {
		return nil
	}
	if obj.ForbiddenKeyError != nil {
		return obj.ForbiddenKeyError
	}

	if obj.QuotaExceededError != nil {
		return obj.QuotaExceededError
	}

	if obj.ResourceExistsError != nil {
		return obj.ResourceExistsError
	}

	// all schemas are nil
	return nil
}

type NullableCreateAsset403Response struct {
	value *CreateAsset403Response
	isSet bool
}

func (v NullableCreateAsset403Response) Get() *CreateAsset403Response {
	return v.value
}

func (v *NullableCreateAsset403Response) Set(val *CreateAsset403Response) {
	v.value = val
	v.isSet = true
}

func (v NullableCreateAsset403Response) IsSet() bool {
	return v.isSet
}

func (v *NullableCreateAsset403Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCreateAsset403Response(val *CreateAsset403Response) *NullableCreateAsset403Response {
	return &NullableCreateAsset403Response{value: val, isSet: true}
}

func (v NullableCreateAsset403Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCreateAsset403Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

