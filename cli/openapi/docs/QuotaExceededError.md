# QuotaExceededError

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Errors** | Pointer to [**QuotaExceededErrorErrors**](QuotaExceededErrorErrors.md) |  | [optional] 
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 

## Methods

### NewQuotaExceededError

`func NewQuotaExceededError() *QuotaExceededError`

NewQuotaExceededError instantiates a new QuotaExceededError object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewQuotaExceededErrorWithDefaults

`func NewQuotaExceededErrorWithDefaults() *QuotaExceededError`

NewQuotaExceededErrorWithDefaults instantiates a new QuotaExceededError object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetErrors

`func (o *QuotaExceededError) GetErrors() QuotaExceededErrorErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *QuotaExceededError) GetErrorsOk() (*QuotaExceededErrorErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *QuotaExceededError) SetErrors(v QuotaExceededErrorErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *QuotaExceededError) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetCode

`func (o *QuotaExceededError) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *QuotaExceededError) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *QuotaExceededError) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *QuotaExceededError) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *QuotaExceededError) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *QuotaExceededError) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *QuotaExceededError) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *QuotaExceededError) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


