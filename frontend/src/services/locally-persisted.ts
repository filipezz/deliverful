import { v5 as uuidv5 } from 'uuid';

class LocallyPersistedObject<T>{

  private _nameSpace = "79c8788e-a2bb-4093-9b60-3756aa87a130" 

  private _value: T | undefined = undefined;
  private _key: string;

  constructor(key: string, initialValue?: T){
    this._key = key

    if (this._getItem() !== undefined){
      this._value = this.value
    }
    else if (initialValue != undefined){
      this.value = initialValue as T
    }
  }

  private _store(newValue: T){
    const jsonValue = JSON.stringify(newValue)
    localStorage.setItem(this.key, jsonValue)
  }

  private _getItem(){
    return localStorage.getItem(this.key)
  }

  private get key() {
    return uuidv5(this._key, this._nameSpace)
  }

  get value(): T {
    if (this._value !== undefined){
      return this._value as T
    }
    
    this._value = JSON.parse(
      this._getItem() as string
      ) as T
      return this._value
  } 

  set value(newValue: T){
    this._value = newValue
    this._store(newValue)
  }
}

export const LocallyPersisted = function<T>(key: string, initialValue?: T){
  return new LocallyPersistedObject(key, initialValue).value
}