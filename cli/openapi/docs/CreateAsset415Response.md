# CreateAsset415Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Errors** | Pointer to [**CreateAsset415ResponseErrors**](CreateAsset415ResponseErrors.md) |  | [optional] 
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 

## Methods

### NewCreateAsset415Response

`func NewCreateAsset415Response() *CreateAsset415Response`

NewCreateAsset415Response instantiates a new CreateAsset415Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAsset415ResponseWithDefaults

`func NewCreateAsset415ResponseWithDefaults() *CreateAsset415Response`

NewCreateAsset415ResponseWithDefaults instantiates a new CreateAsset415Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetErrors

`func (o *CreateAsset415Response) GetErrors() CreateAsset415ResponseErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *CreateAsset415Response) GetErrorsOk() (*CreateAsset415ResponseErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *CreateAsset415Response) SetErrors(v CreateAsset415ResponseErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *CreateAsset415Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetCode

`func (o *CreateAsset415Response) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *CreateAsset415Response) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *CreateAsset415Response) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *CreateAsset415Response) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *CreateAsset415Response) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *CreateAsset415Response) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *CreateAsset415Response) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *CreateAsset415Response) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


