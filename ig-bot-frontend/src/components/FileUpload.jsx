import PropTypes from 'prop-types';

FileUpload.propTypes = {
    accessAllowed: PropTypes.bool
}

FileUpload.defaultProps = {
    accessAllowed: false
}


export default function FileUpload( accessAllowed ) {

    if(accessAllowed){
        return (
            <>
                <form id="file-upload-form" action="/action_page.php">
                <input type="file" id="myFile" name="filename" />
                <input type="submit" />
                </form>
            </>
        )
    }
    else {
        return (
            <>
                <div className="title-text">Access Restricted or Authorization Unsuccesful</div>
                <div className="sub-title-text">Contact Admin for Support</div>
            </>
        )  
    }

}
