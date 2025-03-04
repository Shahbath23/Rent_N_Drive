const idValidationSchema={
    id:{ 
        in:['params'],
        isMongoId:{
            errorMessage:'id is invalid'
        }

    }
}

 export default idValidationSchema