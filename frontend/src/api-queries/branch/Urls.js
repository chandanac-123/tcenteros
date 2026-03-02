import { addBranchCountryApiCall } from "../../api/index";

export const createBranchCount = async()=>{
    try{
        const response = await addBranchCountryApiCall();
        return response.data
    }catch(err){
        console.error("Error at createBrachCount() in Urls.js..",err);
    }
}