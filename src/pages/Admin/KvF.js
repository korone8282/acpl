import React, {useState, useEffect} from 'react'
import Loader from '../../components/Loader';
import { apiConnector } from '../../redux/Utils/apiConnector';
import { useSelector } from 'react-redux';
import { DATA_URL } from '../../redux/Utils/constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import PageTransition from '../PageTransition';

const KvF = () => {


  const arr = [];
  let array = [];
  
  const today = new Date();
  var now = today.toISOString().substring(0,10);

  const [loading, setLoading] = useState(0);
  const [error, setError] = useState(0);
  const [data, setData] = useState();
  const [date, setdate] = useState({datey:now});

  const {userinfo} = useSelector(state => state.auth);
  

  useEffect(() => {
    async function getData(){
      try {
      setError(0);
      setLoading(1);
      
      const res = await apiConnector(`${DATA_URL}/KvF`,"PUT",date,{Authorization: `Bearer ${userinfo.token}`});
  
      setData(res.data.data);
        
      setLoading(0);
      
      } catch (e) {
        setError(1);
        console.log(e);
      }
    }

    getData();
  }, [date,userinfo.token]);

  const inputHandler = async(e) =>{
    setdate((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }
 
  data?.filter(obj=> obj.sectionMain === "Kitchen")?.forEach(ele=>{
    ele.dataList.forEach(e=>{
      let obj = {
        "day":ele.dayTime,
        "product":e.productName,
        "batch":e.batchQuantity,
        "yield":e.yield
      }

      arr.push(obj);

    })
  })

  data?.filter(obj=> obj.sectionMain === "Filling")?.forEach(ele=>{
    ele.dataList.forEach(e=>{
      let obj = {
        "day":ele.dayTime,
        "product":e.productName,
        "count":e.pouchQuantity,
        "size":e.packSize,
        "filled":e.filled
      }


      array.push(obj);

    })
  })

  array = array.filter((value, index, self) =>
    index !== self.findIndex((obj) => (
      obj.product === value.product && obj.day === value.day
    ))
  )

  function yo(val,ele){

    if (arr.length){
      let item = arr.find( obj => obj.day === val.dayTime && obj.product === ele.productName )
      if(item){
      return (item.yield*item.batch)?.toFixed(2)
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    
  } 

  function size(val,ele){

    if ( array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )){
      let item = array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )
      return `${ele.packSize}, ${item.size}`
    } else {
      return ele.packSize
    }
  } 

  function count(val,ele){

    if ( array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )){
      let item = array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )
      return `${ele.pouchQuantity}, ${item.count}`
    } else {
      return ele.pouchQuantity
    }
  } 

  function quant(val,ele){

    if ( array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )){
      let item = array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )
      return ((ele.pouchQuantity*(ele.packSize+0.008))+(item.count*(item.size+0.008)))?.toFixed(2);
    } else {
      return ((ele.packSize+0.008)*ele.pouchQuantity)?.toFixed(2)
    }
  } 

  function waste(val,ele){

    if ( array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )){
      let item = array.find( obj => obj.day === val.dayTime && obj.product === ele.productName )
      return (ele.filled+item.filled ? (ele.filled+item.filled).toFixed(2) : 0);
    } else {
      return (ele.filled ? ele.filled.toFixed(2) : 0)
    }
  } 

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-[100rem] mx-auto space-y-12 text-start">


      <div className="mb-8 space-y-7">
            <h1 className="text-3xl font-semibold text-foreground">Wastage Records</h1>
          
          <div className="flex items-center space-x-4">
            <label className="text-lg text-muted-foreground">Find for:</label>
            <input
              type="date"
              name='datey'
              onChange={ e=> inputHandler(e)}
              className="border bg-[#22252a] border-border rounded-md px-3 py-1.5 text-md focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground shadow-md"
            />
          </div>
        </div>

{
  error ? (<div className='sm:max-lg:mt-4 text-3xl font-bold text-center my-96'> No Data Entry Found</div>
  ):(
    <div>
      {
        loading ? (<Loader/>
        ):(
          <div className="rounded-lg border bg-card">
        <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="text-left">S No.</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Day Time</TableHead>
                <TableHead>Pack Size (g)</TableHead>
                <TableHead>Pouch Filled</TableHead>
                <TableHead>Production (Filling)</TableHead>
                <TableHead>Production (Kitchen)</TableHead>
                <TableHead>Difference (kg)</TableHead>
                <TableHead>Wastage (kg)</TableHead>
                <TableHead>Variance (kg)</TableHead>
              </TableRow>
            </TableHeader>

          <TableBody>
              {
                data?.filter(obj=> obj.sectionMain === "Filling" ).map( (val) =>(
            val.dataList.filter((value, index, self) =>
    index === self.findIndex((obj) => ( obj.productName === value.productName && obj.day === val.day ))).map((ele,index)=>(
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell>⦿</TableCell>
                  <TableCell>{ele.productName}</TableCell>
                  <TableCell>{val.dayTime}</TableCell>
                  <TableCell>{size(val,ele)}</TableCell>
                  <TableCell>{count(val,ele)}</TableCell>
                  <TableCell>{quant(val,ele)}</TableCell>
                  <TableCell>{yo(val,ele)}</TableCell>
                  <TableCell>{(yo(val,ele) - quant(val,ele))?.toFixed(2) }</TableCell>
                  <TableCell>{waste(val,ele)}</TableCell>
                  <TableCell>{(Math.abs(yo(val,ele) - quant(val,ele))-waste(val,ele))?.toFixed(2)}</TableCell>
                </TableRow>
                 ))
               ))
              }
          </TableBody>

          </Table>
        </div>
        )
      }
    </div>
  )
}

      </div>
    </div>
    </PageTransition>
    
  );
}

export default KvF
