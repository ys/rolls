# CreateAsset403Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**Errors** | Pointer to [**QuotaExceededErrorErrors**](QuotaExceededErrorErrors.md) |  | [optional] 

## Methods

### NewCreateAsset403Response

`func NewCreateAsset403Response() *CreateAsset403Response`

NewCreateAsset403Response instantiates a new CreateAsset403Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAsset403ResponseWithDefaults

`func NewCreateAsset403ResponseWithDefaults() *CreateAsset403Response`

NewCreateAsset403ResponseWithDefaults instantiates a new CreateAsset403Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCode

`func (o *CreateAsset403Response) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *CreateAsset403Response) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *CreateAsset403Response) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *CreateAsset403Response) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *CreateAsset403Response) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *CreateAsset403Response) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *CreateAsset403Response) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *CreateAsset403Response) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetErrors

`func (o *CreateAsset403Response) GetErrors() QuotaExceededErrorErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *CreateAsset403Response) GetErrorsOk() (*QuotaExceededErrorErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *CreateAsset403Response) SetErrors(v QuotaExceededErrorErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *CreateAsset403Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


