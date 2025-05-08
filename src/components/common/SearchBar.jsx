import { forwardRef, useState } from "react";
import searchIcon from "@/assets/icons/header/search.png"
import styles from '../layout/Header.module.scss';
import '../../styles/responsive.scss';


const SearchBar = forwardRef(({ placeholder, value, onChange, onSubmit, onClick, isOpenSearch, setIsOpenSearch }, ref) => {
    return (
        <div className={`searchBar-container `} onClick={()=> setIsOpenSearch(true)}>
            <form onSubmit={onSubmit} className={`flex-row-center px-6 py-3 gap-4 border-none border-rounded ${styles.bgElement}`}>
                <img src={searchIcon} width={20} height={20} alt="Search Icon" />
                <input 
                    ref={ref}
                    type="text" 
                    name="search" 
                    autoComplete="off" 
                    onChange={onChange} 
                    onClick={onClick}
                    placeholder={placeholder} 
                    value={value} 
                    className={`w-full outline-none bg-transparent ${!isOpenSearch ? "m_hidden t_hidden" : "block"}`}
                />
            </form>
        </div>
    )
});

SearchBar.displayName = "SearchBar";

export default SearchBar;