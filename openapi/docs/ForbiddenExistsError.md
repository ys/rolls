# ForbiddenExistsError

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Errors** | Pointer to [**ForbiddenExistsErrorErrors**](ForbiddenExistsErrorErrors.md) |  | [optional] 
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 

## Methods

### NewForbiddenExistsError

`func NewForbiddenExistsError() *ForbiddenExistsError`

NewForbiddenExistsError instantiates a new ForbiddenExistsError object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewForbiddenExistsErrorWithDefaults

`func NewForbiddenExistsErrorWithDefaults() *ForbiddenExistsError`

NewForbiddenExistsErrorWithDefaults instantiates a new ForbiddenExistsError object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetErrors

`func (o *ForbiddenExistsError) GetErrors() ForbiddenExistsErrorErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *ForbiddenExistsError) GetErrorsOk() (*ForbiddenExistsErrorErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *ForbiddenExistsError) SetErrors(v ForbiddenExistsErrorErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *ForbiddenExistsError) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetCode

`func (o *ForbiddenExistsError) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *ForbiddenExistsError) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *ForbiddenExistsError) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *ForbiddenExistsError) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *ForbiddenExistsError) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *ForbiddenExistsError) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *ForbiddenExistsError) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *ForbiddenExistsError) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


