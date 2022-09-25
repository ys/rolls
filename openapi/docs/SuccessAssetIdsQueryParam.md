# SuccessAssetIdsQueryParam

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Resources** | Pointer to [**[]SuccessResourcesInner**](SuccessResourcesInner.md) |  | [optional] 
**Errors** | Pointer to [**[]SuccessAssetIdsQueryParamErrorsInner**](SuccessAssetIdsQueryParamErrorsInner.md) |  | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewSuccessAssetIdsQueryParam

`func NewSuccessAssetIdsQueryParam() *SuccessAssetIdsQueryParam`

NewSuccessAssetIdsQueryParam instantiates a new SuccessAssetIdsQueryParam object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSuccessAssetIdsQueryParamWithDefaults

`func NewSuccessAssetIdsQueryParamWithDefaults() *SuccessAssetIdsQueryParam`

NewSuccessAssetIdsQueryParamWithDefaults instantiates a new SuccessAssetIdsQueryParam object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *SuccessAssetIdsQueryParam) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *SuccessAssetIdsQueryParam) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *SuccessAssetIdsQueryParam) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *SuccessAssetIdsQueryParam) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetResources

`func (o *SuccessAssetIdsQueryParam) GetResources() []SuccessResourcesInner`

GetResources returns the Resources field if non-nil, zero value otherwise.

### GetResourcesOk

`func (o *SuccessAssetIdsQueryParam) GetResourcesOk() (*[]SuccessResourcesInner, bool)`

GetResourcesOk returns a tuple with the Resources field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResources

`func (o *SuccessAssetIdsQueryParam) SetResources(v []SuccessResourcesInner)`

SetResources sets Resources field to given value.

### HasResources

`func (o *SuccessAssetIdsQueryParam) HasResources() bool`

HasResources returns a boolean if a field has been set.

### GetErrors

`func (o *SuccessAssetIdsQueryParam) GetErrors() []SuccessAssetIdsQueryParamErrorsInner`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *SuccessAssetIdsQueryParam) GetErrorsOk() (*[]SuccessAssetIdsQueryParamErrorsInner, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *SuccessAssetIdsQueryParam) SetErrors(v []SuccessAssetIdsQueryParamErrorsInner)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *SuccessAssetIdsQueryParam) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetLinks

`func (o *SuccessAssetIdsQueryParam) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *SuccessAssetIdsQueryParam) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *SuccessAssetIdsQueryParam) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *SuccessAssetIdsQueryParam) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


