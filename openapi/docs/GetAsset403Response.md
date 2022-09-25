# GetAsset403Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**Links** | Pointer to [**ForbiddenClientErrorLinks**](ForbiddenClientErrorLinks.md) |  | [optional] 

## Methods

### NewGetAsset403Response

`func NewGetAsset403Response() *GetAsset403Response`

NewGetAsset403Response instantiates a new GetAsset403Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAsset403ResponseWithDefaults

`func NewGetAsset403ResponseWithDefaults() *GetAsset403Response`

NewGetAsset403ResponseWithDefaults instantiates a new GetAsset403Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCode

`func (o *GetAsset403Response) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *GetAsset403Response) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *GetAsset403Response) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *GetAsset403Response) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *GetAsset403Response) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *GetAsset403Response) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *GetAsset403Response) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *GetAsset403Response) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetLinks

`func (o *GetAsset403Response) GetLinks() ForbiddenClientErrorLinks`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *GetAsset403Response) GetLinksOk() (*ForbiddenClientErrorLinks, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *GetAsset403Response) SetLinks(v ForbiddenClientErrorLinks)`

SetLinks sets Links field to given value.

### HasLinks

`func (o *GetAsset403Response) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


