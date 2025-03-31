import React, {useState, useEffect} from 'react'
import { apiConnector } from '../../redux/Utils/apiConnector';
import { useSelector } from 'react-redux';
import { EXPORT_URL } from '../../redux/Utils/constants';
import Loader from '../../components/Loader'
import { useNavigate} from 'react-router-dom';

const ContainerList = () => {

    const {userinfo} = useSelector(state => state.auth);
    
    const [loading, setLoading] = useState(1);
    const [error, setError] = useState(0);
    const [arr, setArr] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        
        async function getData(){
            try {
            setError(0);
            setLoading(1);
            
            const res = await apiConnector(`${EXPORT_URL}/list`,"GET",null,{Authorization: `Bearer ${userinfo.token}`});
            setArr(res.data.data);
    
            setLoading(0);
            
    
            } catch (e) {
              setError(1);
              console.log(e);
            }
          }

          getData();
    }, [userinfo.token]);

  return (
    <div>
      {
        error ? (<div className='text-center font-bold text-7xl mt-64 text-[#f59e0b]'>No Data Entry Found</div>
        ) : (
            <div>
                {
                    loading ? (<Loader/>
                    ) : (
                        <div className='flex flex-wrap gap-12 sm:max-lg:gap-9 my-4 mx-9'>
                            {
                                arr.map((val,ind)=>(
                                    <div key={ind}
                                         onClick={()=>navigate(`${val._id}`)}
                                         >
                                 
<div class="w-72 h-48 flex justify-center items-center relative hover:translate-y-2">

  
<div class="blur absolute inset-0 rounded-lg -translate-x-1 translate-y-1 bg-gradient-to-br from-cyan-500 to-violet-400"></div>

    
<div class="relative w-[98%] h-[96%] bg-black rounded-lg p-4">
    <p class="ml-2 text-4xl text-primary p-3">{val.name}</p>
</div>

</div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        )
      }
    </div>
  )
}

export default ContainerList
