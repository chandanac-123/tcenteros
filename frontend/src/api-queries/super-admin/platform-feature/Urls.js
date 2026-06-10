import { addPlatformFeatures, deletePlatformFeature, getPlatformFeatureById, getPlatformFeatures, updatePlatformFeature } from ".";



export const createPlatformFeatuer_Url = async (data) => {
    try {
        const response = await addPlatformFeatures(data);
        return response.data
    } catch (err) {
        throw err;
    }
}

export const getPlatformFeatureById_Url = async (id) => {
    try {
        const response = await getPlatformFeatureById(id);
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const updatePlatformFeature_Url = async ({ id, data }) => {
    try {
        const response = await updatePlatformFeature(id, data);
        return response.data;
    } catch (err) {
        throw err;
    }
};


export const deletePlatformFeature_Url = async (id) => {
    try {
        const response = await deletePlatformFeature(id);
        return response.data;
    } catch (err) {
        throw err;
    }
};


export const getPlatformFeature_Url = async () => {
    try {
        const response = await getPlatformFeatures();
        return response.data;
    } catch (err) {
        throw err;
    }
};