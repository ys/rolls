# ForbiddenClientError

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**Links** | Pointer to [**ForbiddenClientErrorLinks**](ForbiddenClientErrorLinks.md) |  | [optional] 

## Methods

### NewForbiddenClientError

`func NewForbiddenClientError() *ForbiddenClientError`

NewForbiddenClientError instantiates a new ForbiddenClientError object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewForbiddenClientErrorWithDefaults

`func NewForbiddenClientErrorWithDefaults() *ForbiddenClientError`

NewForbiddenClientErrorWithDefaults instantiates a new ForbiddenClientError object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCode

`func (o *ForbiddenClientError) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *ForbiddenClientError) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *ForbiddenClientError) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *ForbiddenClientError) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *ForbiddenClientError) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *ForbiddenClientError) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *ForbiddenClientError) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *ForbiddenClientError) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetLinks

`func (o *ForbiddenClientError) GetLinks() ForbiddenClientErrorLinks`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *ForbiddenClientError) GetLinksOk() (*ForbiddenClientErrorLinks, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *ForbiddenClientError) SetLinks(v ForbiddenClientErrorLinks)`

SetLinks sets Links field to given value.

### HasLinks

`func (o *ForbiddenClientError) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


