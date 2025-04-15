import { forwardRef } from "react";
import searchIcon from "@/assets/icons/header/search.png"
import styles from '../layout/Header.module.scss';

const SearchBar = forwardRef(({ placeholder, value, onChange, onSubmit, onClick }, ref) => {
    return (
        <div className="searchBar-container">
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
                    className="w-full outline-none bg-transparent"
                />
            </form>
        </div>
    )
});

SearchBar.displayName = "SearchBar";

export default SearchBar;