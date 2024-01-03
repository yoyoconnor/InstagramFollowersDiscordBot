//basic react component to sort out comment section and filter by users discord sstatus being in a certain channel

import React, { useState, useEffect } from 'react'

const CommentPanel = (params) => {
    //place to provide link of instagram reel to use insta graph api to get comments
    const [url, setUrl] = useState('')
    //place to store comments
    const [comments, setComments] = useState([])
    //place to store filtered comments
    const [filteredComments, setFilteredComments] = useState([])
    
    //jsx input for url
    const urlInput = <input type="text" onChange={(e) => setUrl(e.target.value)} placeholder="Enter Instagram Reel URL" />
    //use instagram graph api to get comments from instagram reel
    const getComments = () => {
        fetch(`https://graph.facebook.com/v11.0/instagram_oembed?url=${url}&access_token=${params.token}`)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setComments(data)
            })
    }
    //jsx button to get comments
    const getCommentsButton = <button onClick={getComments}>Get Comments</button>
    
        


    const asyncfilterComments = async (filterLevel) => {
        //example filter options 
        //const filterOptions:: 1:all, 2:discordMember, 3:verifiedFollower, 4:inStage, 5:inStageAndVerifiedFollower
        let users = new Set()
            comments.forEach(comment => {
                users.add(comment.author_name)
            })
        let userData= await fetch(`${process.env.BACKEND_HOST}/api/dataByInstagramUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: Array.from(users)
            })
        })
        userData = await userData.json()
        //^shoukd be an array of objects with the following structure
        // {
        //     instagramUser: String,
        //     discordUser: String, or null//null signifies that the user is not in the discord server
        //     stageStatus: boolean, //true if user is in stage channel
        //     verifiedFollower: boolean //true if user is a verified follower
        // }
        if(filterLevel === 1){
            setFilteredComments(comments)
            return;
        }

        if(filterLevel === 2){
            setFilteredComments(
                comments.filter(comment => {
                  const matchingUser = userData.find(user => user.instagramUser === comment.author_name);
                  return matchingUser && matchingUser.discordUser !== null;
                })
              );
              
        }
        if(filterLevel === 3){
            setFilteredComments(
                comments.filter(comment => {
                  const matchingUser = userData.find(user => user.instagramUser === comment.author_name);
                  return matchingUser && matchingUser.verifiedFollower === true;
                })
              );
        }
        if(filterLevel === 4){
            setFilteredComments(
                comments.filter(comment => {
                  const matchingUser = userData.find(user => user.instagramUser === comment.author_name);
                  return matchingUser && matchingUser.stageStatus === true;
                })
              );
        }
        if(filterLevel === 5){
            setFilteredComments(
                comments.filter(comment => {
                  const matchingUser = userData.find(user => user.instagramUser === comment.author_name);
                  return matchingUser && matchingUser.stageStatus === true && matchingUser.verifiedFollower === true;
                })
              );
        }
    }
}