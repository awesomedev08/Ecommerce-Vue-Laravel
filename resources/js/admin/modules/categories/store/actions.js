import {Form} from 'vform'
export default {
    addCategory({commit , dispatch , state }){
        state.addData.post('/api/admin/categories')
        .then(res => {
            if (res.status == 201) {
                commit('CREATE_CATEGORY' , res.data);
                $Notice.info({
                    title: 'Category Added Successfully',
                    desc: `${state.addData.name} added`
                });
                state.addData = new Form({name:"",icon:""})
                commit('TOGGLE_MODAL','cat-add')

             }
        }).catch (error => {
            if (error.response.status == 403){
                $Notice.error({
                    title: 'Category Create Failed!',
                    desc: error.response.data.message
                });
            }
           if (error.response.status == 422) {
             commit('SET_ERRORS' , error.response.data.errors)
           }
       })

   },
    async getCategories({commit ,state , getters}){
       try {
        let res =   await axios.get(`/api/admin/categories?${getters.getFilteredURLString}`);
        if (res.status == 200) {
            let updatedFilterString = {
                page: parseInt(res.data.current_page),
                perPage :parseInt(res.data.per_page),
                total: parseInt(res.data.total),
                q: ""
            }
            commit('FILTER_DATA', updatedFilterString)
            commit('FETCH_CATEGORIES' , res.data.data);

         }
       } catch (error) {
           if (error.response.status == 403) {
              $Notice.error({
                    title: 'Category FETCH Failed!',
                    desc: error.response.data.message
                });
           }

       }
    },
    editCategory({commit,dispatch , state } ){
        state.editData.put(`/api/admin/categories/${state.editData.id}`).then(res => {
            if (res.status == 200) {
                $Notice.info({
                    title: 'Category Updated Successfully',
                    desc: `${state.editData.name} edited`
                });
                // dispatch get categories can make slow browsing - this is an old idea
                // dispatch('getCategories');
                // best practice is updating UI without making a new ajax request
                commit('UPDATE_CATEGORY')
                commit('TOGGLE_MODAL','cat-edit')
             }
        }).catch (error => {
            if (error.response.status == 403){
                $Notice.error({
                    title: 'Category Update Failed!',
                    desc: error.response.data.message
                });
            }
            if (error.response.status == 422) {

                $Notice.error({
                    title: 'Category Update Failed!',
                    desc: error.response.data.message
                });
                commit('SET_ERRORS' , error.response.data.errors)
              }
       })
    },
    async deleteCategory({commit} , category){
        try {

            let res =   await axios.delete(`/api/admin/categories/${category.id}`);
            if (res.status == 200) {
                $Notice.success({
                    title: 'Category Deleted Successfully',
                    desc: `${category.name} deleted`
                });
                commit('DELETE_CATEGORY' , category);
                // commit('DELETE_SUB_CATEGORIES',category.subcategories)
            }
        } catch (error) {
           if (error.response.status == 403) {
              $Notice.error({
                    title: 'Category Delete Failed!',
                    desc: error.response.data.message
                });
           }
            $Notice.error({
                title: 'Something went wrong',
                desc: error.response.data.message
            });
        }

    },
    async multiDelete({state , commit}){
        try {
            let res =   await axios.post(`/api/admin/categories/multi`,state.multiSelected);
            if (res.status == 200) {
                commit('DELETE_MULTI_CATEGORY' , state.multiSelected);
                // commit('DELETE_MULTI_SUB_CATEGORY' , state.subMeta.multiSelected);
                // state.multiSelected = [];
                $Notice.success({
                    title: 'Selected Category Deleted Successfully',
                    desc: ` deleted`
                });

            }
        } catch (error) {
            state.multiSelected = [];
           if (error.response.status == 403) {
              $Notice.error({
                    title: 'Category Delete Failed!',
                    desc: error.response.data.message
                });

           }
            $Notice.error({
                title: 'Something went wrong',
                desc: error.response.data.message
            });
        }

    },
    handleBeforeUpload({state},file){
        if (state.addMeta.showModal && state.addData.name == "" || state.editMeta.showModal && state.editData.name == "" ) {
            $Notice.warning({
                title: "Enter Category Name First",
                desc: "NAME REQUIRED"
            });
        } else {
            const reader = new FileReader();
            let _this = this

            reader.readAsDataURL(file);
            reader.onloadend = function(e){
                file.url = reader.result
                if (state.addMeta.showModal) {
                    state.addData.icon = file.url
                } else {
                    state.editData.icon = file.url
                }
            }
            return false;
        }
    },
    handleSuccess({state},res) {

        if (state.isEditingItem) {
            return (state.editData.icon = res);
        }
        return state.addData.icon = res;
    },
    handleError({state},res, file) {
        console.log('RESPONSE : handleError' , res.errors);

        $Notice.warning({
            title: "The file format is incorrect",
            // desc: `${res.errors.icon && res.errors.icon.length ? res.errors.icon[0] : "Something went wrong!"}`
        });
    },
    handleFormatError(file) {
        $Notice.warning({
            title: "The file format is incorrect",
            desc: "File format of " +file.name +" is incorrect, please select jpg or png."
        });
    },
    handleMaxSize(file) {
        $Notice.warning({
            title: "Exceeding file size limit",
            desc: "File  " + file.name + " is too large, no more than 2M."
        });
    },
    async deleteImage({state}, isAddImage = true){
        if (isAddImage) {
            state.addData.icon = ''
        } else {
            state.isEditingItem = true
            state.editData.icon = ''
        }
        $Bus.$emit('clearAddedFiles')

    },
    handleSelectionChange({state} , val){
        state.multiSelected = val
    },
    handleImageView({commit}, payload){
        commit('HANDLE_VIEW' , payload)
    },
    changePaginatedPage({state,commit ,dispatch } , page){
       commit('FILTER_DATA', {page})
       dispatch('getCategories')
    },
    changePaginatedPerPage({state,commit , dispatch} , perPage){
        commit('FILTER_DATA', {perPage})
        dispatch('getCategories')
    }
}