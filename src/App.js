import React,{useEffect,useState} from "react";
import {nanoid} from "nanoid";
import axios from "axios";

import "./App.css"

const mainUrl = "https://api.unsplash.com/photos/"
// const key = `${process.env.REACT_APP_ACESS_KEY}`
const key = '67dzJ6HsOJ0oE9moFGN9_AGJ-de6jwkL-CAULtu3QWg'

function App(){
  const [photo, setPhoto] = useState([])
  const [loading, setLoading] = useState("Loading...")
  const [selected, setSelected] = useState(null)
  const [click, setClick] = useState(false)
  const [totalSteps, setTotalSteps] = useState(0)
  const [reset, setReset] = useState(false)

  const fetching = () => {
    const url1 = `${mainUrl}/?client_id=${key}&page=${3}`;
    const url2 = `${mainUrl}/?client_id=${key}&page=${4}`;
    axios
      .all([axios.get(url1), axios.get(url2)])
      .then(([page1, page2]) => {
        console.log(page2.data.slice(0,2),"axios")
        let data = [...page1.data,...page1.data,...page2.data.slice(0,2),...page2.data.slice(0,2)]
        console.log(data)
        data = data.map(i=>{
          return {...i,"unique":nanoid()}
        })
        const shuffle =(array)=>{
            for(let i=0;i<array.length;i++){
              let temp = Math.floor(Math.random()*array.length)
              let curr = array[temp]
              array[temp] = array[i]
              array[i] = curr
            }
            return array
          }
          data = shuffle(data)
          setPhoto(data)
      })
      .catch((err) => console.log(err));
  };

  useEffect(()=>{
    setLoading("Loading...")
    setSelected(null)
    setTotalSteps(0)
    setPhoto([])
    setTimeout(()=>{
      setLoading("")
      fetching()
    },500)
  },[reset])
  const handleClick = (id)=>{
    // get index of clicked image
    const found = photo.findIndex(i=>i.unique === id)
    // return from function if clicked image's blur prop is empty
    if(!photo[found].blur_hash){
      return;
    }
    const modified = photo.map(i=>{
      if(i.unique === id){
        return {...i, liked_by_user: true}
      }
      return i
    })
    if(selected === null){
      setSelected(modified[found])
      setPhoto(modified)
      setTotalSteps(totalSteps+1)
    }else{
      setPhoto(modified)
      if(photo[found].id!==selected.id){
        setTotalSteps(totalSteps+1)
        const data = photo.map(i=>({...i,liked_by_user : false}))
        setClick(true)
        setTimeout(()=>{
          setPhoto(data)
          setClick(false)
        },1000)
        setSelected(null)
      }
      // if clicked photo and State photo has common natural id, apply "" blur hash for further deactivation
      else{
        // check if same photo is not clicked twice 
        if(photo[found].unique!==selected.unique){
          setTotalSteps(totalSteps+1)
          const newData = photo.map( i=> i.id === selected.id ? {...i,blur_hash:""} : i )
          setPhoto(newData) // two photos will have empty blur hash, so no longer will be disappeared and active
          setSelected(null) //empty temp state
      }
      }
    }
    
  }
  const resetApp = ()=>{
    setReset(!reset)
  }
  return (
    <>
      <div className = "App">
        { loading ||
          photo.map(i=>{
              let cl
              // const cl = !i.liked_by_user || i.blur_hash ? "" : "show"
              if(!i.liked_by_user){
                cl = ""
              }
              if(i.liked_by_user || !i.blur_hash){
                cl= "show"
              }
              return <div disabled = {!i.blur_hash} className="single-card" key={i.unique} onClick={ !click ? ()=>handleClick(i.unique): null}> <img  className={cl} src={i.urls.thumb} alt={i.alt_description}/> </div>
            }
          )
        }
      </div>
      <div id="click">
        <span>Clicks</span>
        <span id="counter">{totalSteps}</span>
        <button onClick={resetApp}>reset</button>
      </div>
    </>
    
  )
}

export default App;