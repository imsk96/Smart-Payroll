export default function Dashboard(){

return (

<div style={{
padding:"30px",
fontFamily:"Arial"
}}>

<h1>
Smart Attendance Payroll
</h1>


<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"20px"
}}>


<Card title="Employees" value="0"/>

<Card title="Monthly Salary" value="₹0"/>

<Card title="Total Fine" value="₹0"/>


</div>


</div>

)

}


function Card({title,value}){

return (

<div style={{
padding:"25px",
borderRadius:"15px",
background:"#f2f2f2"
}}>

<h3>{title}</h3>

<h2>{value}</h2>


</div>

)

}