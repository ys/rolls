# ResourceExistsError

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Errors** | Pointer to [**ForbiddenExistsErrorErrors**](ForbiddenExistsErrorErrors.md) |  | [optional] 
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 

## Methods

### NewResourceExistsError

`func NewResourceExistsError() *ResourceExistsError`

NewResourceExistsError instantiates a new ResourceExistsError object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewResourceExistsErrorWithDefaults

`func NewResourceExistsErrorWithDefaults() *ResourceExistsError`

NewResourceExistsErrorWithDefaults instantiates a new ResourceExistsError object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetErrors

`func (o *ResourceExistsError) GetErrors() ForbiddenExistsErrorErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *ResourceExistsError) GetErrorsOk() (*ForbiddenExistsErrorErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *ResourceExistsError) SetErrors(v ForbiddenExistsErrorErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *ResourceExistsError) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetCode

`func (o *ResourceExistsError) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *ResourceExistsError) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *ResourceExistsError) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *ResourceExistsError) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *ResourceExistsError) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *ResourceExistsError) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *ResourceExistsError) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *ResourceExistsError) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


