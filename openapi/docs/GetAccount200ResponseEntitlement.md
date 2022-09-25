# GetAccount200ResponseEntitlement

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | Pointer to **string** | The status can take on one of five values from created, trial, trial_expired, subscriber, and subscriber_expired. The created status indicates the user has not yet stepped into any Creative Cloud offering, whether trial or subscription. It is a minimally-entitled Adobe ID. | [optional] 
**Trial** | Pointer to **map[string]interface{}** |  | [optional] 
**CurrentSubs** | Pointer to **map[string]interface{}** |  | [optional] 
**Storage** | Pointer to [**GetAccount200ResponseEntitlementStorage**](GetAccount200ResponseEntitlementStorage.md) |  | [optional] 
**DeletionDate** | Pointer to **string** |  | [optional] 

## Methods

### NewGetAccount200ResponseEntitlement

`func NewGetAccount200ResponseEntitlement() *GetAccount200ResponseEntitlement`

NewGetAccount200ResponseEntitlement instantiates a new GetAccount200ResponseEntitlement object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAccount200ResponseEntitlementWithDefaults

`func NewGetAccount200ResponseEntitlementWithDefaults() *GetAccount200ResponseEntitlement`

NewGetAccount200ResponseEntitlementWithDefaults instantiates a new GetAccount200ResponseEntitlement object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *GetAccount200ResponseEntitlement) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GetAccount200ResponseEntitlement) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GetAccount200ResponseEntitlement) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *GetAccount200ResponseEntitlement) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetTrial

`func (o *GetAccount200ResponseEntitlement) GetTrial() map[string]interface{}`

GetTrial returns the Trial field if non-nil, zero value otherwise.

### GetTrialOk

`func (o *GetAccount200ResponseEntitlement) GetTrialOk() (*map[string]interface{}, bool)`

GetTrialOk returns a tuple with the Trial field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrial

`func (o *GetAccount200ResponseEntitlement) SetTrial(v map[string]interface{})`

SetTrial sets Trial field to given value.

### HasTrial

`func (o *GetAccount200ResponseEntitlement) HasTrial() bool`

HasTrial returns a boolean if a field has been set.

### GetCurrentSubs

`func (o *GetAccount200ResponseEntitlement) GetCurrentSubs() map[string]interface{}`

GetCurrentSubs returns the CurrentSubs field if non-nil, zero value otherwise.

### GetCurrentSubsOk

`func (o *GetAccount200ResponseEntitlement) GetCurrentSubsOk() (*map[string]interface{}, bool)`

GetCurrentSubsOk returns a tuple with the CurrentSubs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentSubs

`func (o *GetAccount200ResponseEntitlement) SetCurrentSubs(v map[string]interface{})`

SetCurrentSubs sets CurrentSubs field to given value.

### HasCurrentSubs

`func (o *GetAccount200ResponseEntitlement) HasCurrentSubs() bool`

HasCurrentSubs returns a boolean if a field has been set.

### GetStorage

`func (o *GetAccount200ResponseEntitlement) GetStorage() GetAccount200ResponseEntitlementStorage`

GetStorage returns the Storage field if non-nil, zero value otherwise.

### GetStorageOk

`func (o *GetAccount200ResponseEntitlement) GetStorageOk() (*GetAccount200ResponseEntitlementStorage, bool)`

GetStorageOk returns a tuple with the Storage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStorage

`func (o *GetAccount200ResponseEntitlement) SetStorage(v GetAccount200ResponseEntitlementStorage)`

SetStorage sets Storage field to given value.

### HasStorage

`func (o *GetAccount200ResponseEntitlement) HasStorage() bool`

HasStorage returns a boolean if a field has been set.

### GetDeletionDate

`func (o *GetAccount200ResponseEntitlement) GetDeletionDate() string`

GetDeletionDate returns the DeletionDate field if non-nil, zero value otherwise.

### GetDeletionDateOk

`func (o *GetAccount200ResponseEntitlement) GetDeletionDateOk() (*string, bool)`

GetDeletionDateOk returns a tuple with the DeletionDate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeletionDate

`func (o *GetAccount200ResponseEntitlement) SetDeletionDate(v string)`

SetDeletionDate sets DeletionDate field to given value.

### HasDeletionDate

`func (o *GetAccount200ResponseEntitlement) HasDeletionDate() bool`

HasDeletionDate returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


