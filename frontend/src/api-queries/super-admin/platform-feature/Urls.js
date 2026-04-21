import { addPlatformFeatures, deletePlatformFeature, getPlatformFeatureById, getPlatformFeatures, updatePlatformFeature } from ".";



export const createPlatformFeatuer_Url = async (data) => {
    try {
        const response = await addPlatformFeatures(data);
        return response.data
    } catch (err) {
        console.error("Error at Adding platform feature in Urls.js", err);
        throw err;
    }
}

export const getPlatformFeatureById_Url = async (id) => {
    try {
        const response = await getPlatformFeatureById(id);
        return response.data;
    } catch (err) {
        console.error("Error fetching platform feature by id", err);
        throw err;
    }
};

export const updatePlatformFeature_Url = async ({ id, data }) => {
    try {
        const response = await updatePlatformFeature(id, data);
        return response.data;
    } catch (err) {
        console.error("Error updating platform feature", err);
        throw err;
    }
};


export const deletePlatformFeature_Url = async (id) => {
    try {
        const response = await deletePlatformFeature(id);
        return response.data;
    } catch (err) {
        console.error("Error deleting platform feature", err);
        throw err;
    }
};


export const getPlatformFeature_Url = async () => {
    try {
        const response = await getPlatformFeatures();
        return response.data;
    } catch (err) {
        console.error("Error fetching platform features center count", err);
        throw err;
    }
};