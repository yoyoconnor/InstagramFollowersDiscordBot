import PropTypes from 'prop-types';

FileUpload.propTypes = {
    accessAllowed: PropTypes.bool
}

FileUpload.defaultProps = {
    accessAllowed: false
}


export default function FileUpload( { accessAllowed } ) {


    if(accessAllowed){
        return (
            <>
                <div className='sub-title-text'>Upload your file</div>
                <form id="file-upload-form" action="/action_page.php">
                <input title='' type="file" id="myFile" name="filename" />
                <input id='submit-button' type="submit" />
                </form>
            </>
        )
    }
    else {
        return (
            <>
                <div className="title-text">Authorization Unsuccesful</div>
                <div className="sub-title-text">Contact Admin for Support</div>
            </>
        )  
    }

}
