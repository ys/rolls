# Success

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Resources** | Pointer to [**[]SuccessResourcesInner**](SuccessResourcesInner.md) |  | [optional] 

## Methods

### NewSuccess

`func NewSuccess() *Success`

NewSuccess instantiates a new Success object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSuccessWithDefaults

`func NewSuccessWithDefaults() *Success`

NewSuccessWithDefaults instantiates a new Success object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *Success) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *Success) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *Success) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *Success) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetResources

`func (o *Success) GetResources() []SuccessResourcesInner`

GetResources returns the Resources field if non-nil, zero value otherwise.

### GetResourcesOk

`func (o *Success) GetResourcesOk() (*[]SuccessResourcesInner, bool)`

GetResourcesOk returns a tuple with the Resources field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResources

`func (o *Success) SetResources(v []SuccessResourcesInner)`

SetResources sets Resources field to given value.

### HasResources

`func (o *Success) HasResources() bool`

HasResources returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


