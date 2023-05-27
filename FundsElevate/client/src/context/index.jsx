import {useContext, createContext} from 'react';

import { useAddress,useContract,useMetamask,useContractWrite } from '@thirdweb-dev/react';
import{ethers} from 'ethers';

const StateContext=createContext();

export const StateContextProvider=({children})=> {
const {contract}=useContract('0xC2789C9429Ca9d700e1C2cf9b62760b5411e8127');

const {mutateAsync:createCampaign }=
useContractWrite(contract,'createCampaign');

const address=useAddress();
const connect=useMetamask();

const publishCampaign=async(form) => {
    try{
    const data=await createCampaign([
        address,
        form.title,
        form.description,
        form.target,
        new Date(form.deadline).getTime(),
        form.image  
    ])
    console.log("contract call success",data)
}catch(error){
    console.log("contract call failure",error)
}
}
const getCampaign=async()=>{
    const campaigns=await contract.call
    ('getCampaign');

    const parsedCampaigns=campaigns.map((campaign,i)=>({
        owner:campaign.owner,
        title:campaign.title,
        description:campaign.description,
        target:ethers.utils.formatEther(campaign.target.toString()),
        deadline:campaign.deadline.toNumber(),
        amountCollected:ethers.utils.formatEther(campaign.amountCollected.toString()),
        image:campaign.image,
        pId:i

     
    }));
    return parsedCampaigns;
}

const getUserCampaigns=async()=>{
    const allCampaigns=await getCampaign();
    const filteredCampaigns=allCampaigns.filter((campaign)=>
    campaign.owner===address);
    return filteredCampaigns;
}

const donate=async(pId,amount)=>{
    const data=await contract.call('donateToCampaign',pId,{value:ethers.utils.parseEther(amount)});

return data;
}

const getDonations=async(pId)=>{
    const donations=await contract.call('getDonators',pId);
    const numberOfDonations=donations[0].length;

    const parsedDonations=[];
    for(let i=0;i<numberOfDonations;i++){
        parsedDonations.push({
            donator:donations[0][i],
            donation:ethers.utils.formatEther(donations[1][i].toString())
        })
    }
    return parsedDonations
}

return(
    <StateContext.Provider
    value={{
        address,
    contract,
    connect,
        createCampaign: publishCampaign,
        getCampaign,
        getUserCampaigns,
        donate,
        getDonations,
}}
>
{children}
</StateContext.Provider>
)
}

export const useStateContext=()=>useContext
(StateContext);
