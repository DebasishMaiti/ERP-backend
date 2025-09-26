import axios from "axios";
 
const rootUrl = "http://localhost:8000/api/";

const teamUrl = rootUrl + 'team';
const vendorUrl = rootUrl + 'vendor';
const itemUrl = rootUrl + 'item';
const poUrl = rootUrl + 'po';
const projectUrl = rootUrl + 'project';
const indentUrl = rootUrl + 'indent';
const boqUrl = rootUrl + 'boq';
const reportUrl = rootUrl + 'report'

//vendor

async function getAllVendor (){
    return await axios.get(vendorUrl);
}

async function createVendor(data){
    return await axios.post(vendorUrl,data);
}

async function getVendorById(id){
    return await axios.get(vendorUrl+`/${id}`)
}

async function UpdateVendor(id, data){
    return await axios.put(vendorUrl+`/${id}`,data)
}

async function deleteVendor(id){
    return axios.patch(vendorUrl+`/${id}`)
}

//item

async function getAllItem (){
    return await axios.get(itemUrl);
} 

async function createItem(data){
    return await axios.post(itemUrl,data);
}

async function getItemById(id){
    return await axios.get(itemUrl+`/${id}`);
}

async function UpdateItem (id, data){
    return await axios.put(itemUrl+`/${id}`, data);
}

async function deleteItem(id){
    return await axios.patch(itemUrl+`/${id}`);
}

//team

async function getAllTeam(){
    return await axios.get(teamUrl);
}

async function createTeam(data){
    return await axios.post(teamUrl);
}

async function getTeamById(id){
    return await axios.get(teamUrl+`/${id}`);
}

async function updateTeam(id, data){
    return await axios.put(teamUrl+`/${id}`, data);
}

async function deleteTeam(id){
    return await axios.patch(teamUrl+`/${id}`);
}

//po

async function getAllPo(){
    return await axios.get(poUrl)
}

async function createPo(data){
    return await axios.post(poUrl,data)
}

async function getPoById(id){
    return await axios.get(poUrl+`/${id}`)
}

async function updatePo(id){
    return await axios.get(poUrl+`/${id}`)
}

async function deletePo(id){
    return await axios.get(poUrl+`/${id}`)
}

//project

async function getAllProject (){
    return await axios.get(projectUrl);
}

async function createProject(data) {
    return await axios.post(projectUrl,data)
}

async function getProjectById(id){
    return await axios.get(projectUrl+`/${id}`)
}

async function updateProject(id,data){
    return await axios.put(projectUrl+`/${id}`,data)
}

async function deleteProject(id){
    return await axios.patch(projectUrl+`/${id}`)
}

//boq

async function getAllBoq(){
    return await axios.get(boqUrl);
}

async function createBoq(data) {
    return axios.post(boqUrl,data)
}

async function getBoqById(id){
    return await axios.get(boqUrl+`/${id}`)
}

async function updateBoq(id, data){
    return await axios.put(boqUrl+`/${id}`,data)
}

async function deleteBoq(id){
    return await axios.patch(boqUrl+`/${id}`)
}

//indent

async function getAllIndent(){
    return await axios.post(indentUrl);
}

async function createIndent(data){
    return await axios.post(indentUrl, data)
}
async function getIndentById(id){
    return await axios.get(indentUrl+`/${id}`)
}

async function updateIndent(id,data){
    return await axios.put(indentUrl+`/${id}`,data)
}

async function  deleteindent(id){
    return await axios.patch(indentUrl+`/${id}`)
}

//report

async function  getReport(){
    return await axios.get(reportUrl);
}

export const service = {
    getAllVendor, createVendor, getVendorById, UpdateVendor, deleteVendor,

    getAllItem, createItem, getItemById, UpdateItem, deleteItem,

    getAllTeam, createTeam, getTeamById, updateTeam, deleteTeam,

    getAllPo, createPo, getPoById, updatePo, deletePo,

    getAllProject, createProject, getProjectById, updateProject, deleteProject,

    getAllBoq, createBoq, getBoqById, updateBoq, deleteBoq, 

    getAllIndent, createIndent, getIndentById, updateIndent, deleteindent,

    getReport
}
